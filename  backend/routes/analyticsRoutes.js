// routes/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { protect, admin } = require('../middleware/authMiddleware'); // Use 'admin' selectively if needed
const Invoice = require('../models/Invoice');
const Product = require('../models/Product');
const regression = require('regression'); // For prediction (if used)

// --- Helper: Get Start of Day ---
const getStartOfDay = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};

// --- Helper: Get Start of Month ---
const getStartOfMonth = (date) => {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth(), 1);
};

// --- GET DASHBOARD SUMMARY ---
// @route   GET /api/analytics/dashboard-summary
// @desc    Get summary data for the dashboard cards & lists
// @access  Private (Accessible to logged-in users)
router.get('/dashboard-summary', protect, async (req, res) => {
    try {
        const today = new Date();
        const startOfToday = getStartOfDay(today);
        const startOfMonth = getStartOfMonth(today);
        const ninetyDaysAgo = new Date(new Date().setDate(today.getDate() - 90));

        // Use Promise.all for concurrent queries
        const [
            totalProductCount,
            outOfStockCount,
            lowStockProducts, // Fetch products for counting AND display
            revenueTodayData,
            revenueThisMonthData,
            totalRevenueData,
            topSellingProductsData,
            lowestSellingProductsData,
            recentInvoicesData // Added for display
        ] = await Promise.all([
            Product.countDocuments(),
            Product.countDocuments({ currentStock: { $lte: 0 } }),
            Product.find({ // Low stock products (excluding out of stock)
                $expr: { $lte: ["$currentStock", "$lowStockThreshold"] },
                currentStock: { $gt: 0 }
            }).limit(10).select('name currentStock lowStockThreshold'), // Limit for display
            Invoice.aggregate([
                { $match: { createdAt: { $gte: startOfToday } } },
                { $group: { _id: null, total: { $sum: '$grandTotal' } } }
            ]),
            Invoice.aggregate([
                { $match: { createdAt: { $gte: startOfMonth } } },
                { $group: { _id: null, total: { $sum: '$grandTotal' } } }
            ]),
            Invoice.aggregate([
                { $group: { _id: null, total: { $sum: '$grandTotal' } } }
            ]),
            Invoice.aggregate([ // Top 5 Selling Products (Units, last 90 days)
                 { $match: { createdAt: { $gte: ninetyDaysAgo } } },
                 { $unwind: '$items' },
                 { $group: { _id: '$items.product', totalQuantity: { $sum: '$items.quantity' } } },
                 { $sort: { totalQuantity: -1 } },
                 { $limit: 5 },
                 { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'productDetails', pipeline: [ { $project: { name: 1 } } ] } }, // Optimize lookup
                 { $unwind: '$productDetails' },
                 { $project: { _id: 1, name: '$productDetails.name', quantity: '$totalQuantity' } }
            ]),
            Invoice.aggregate([ // Lowest 5 Selling Products (Units, last 90 days)
                 { $match: { createdAt: { $gte: ninetyDaysAgo } } },
                 { $unwind: '$items' },
                 { $group: { _id: '$items.product', totalQuantity: { $sum: '$items.quantity' } } },
                 { $sort: { totalQuantity: 1 } },
                 { $limit: 5 },
                 { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'productDetails', pipeline: [ { $project: { name: 1 } } ] } },
                 { $unwind: '$productDetails' },
                 { $project: { _id: 1, name: '$productDetails.name', quantity: '$totalQuantity' } }
            ]),
            Invoice.find({}) // Recent Invoices for display
                    .sort({createdAt: -1})
                    .limit(5)
                    .select('invoiceNumber customerName createdAt grandTotal') // Select fields for display
        ]);

        // Format results
        const revenueToday = revenueTodayData.length > 0 ? revenueTodayData[0].total : 0;
        const revenueThisMonth = revenueThisMonthData.length > 0 ? revenueThisMonthData[0].total : 0;
        const totalRevenue = totalRevenueData.length > 0 ? totalRevenueData[0].total : 0;

        // Generate alerts from low stock products fetched
        const alerts = lowStockProducts.map(p => ({
            type: 'LowStock',
            message: `Low stock warning: ${p.name} (${p.currentStock} units left, threshold: ${p.lowStockThreshold})`,
            productId: p._id // Include ID if frontend needs to link
        }));
        // You could add other alert types here later (e.g., fetch out-of-stock products, overdue invoices)

        res.json({
            productCount: totalProductCount,
            outOfStockCount: outOfStockCount,
            lowStockCount: lowStockProducts.length, // Count from the fetched array
            revenueToday: revenueToday.toFixed(2),
            revenueThisMonth: revenueThisMonth.toFixed(2),
            totalRevenue: totalRevenue.toFixed(2),
            topSellingProducts: topSellingProductsData, // name, quantity
            lowestSellingProducts: lowestSellingProductsData, // name, quantity
            recentInvoices: recentInvoicesData, // invoiceNumber, customerName, createdAt, grandTotal
            alerts: alerts // Low stock alerts
        });

    } catch (error) {
        console.error('Error fetching dashboard summary data:', error);
        res.status(500).json({ message: 'Server error fetching dashboard summary' });
    }
});


// --- GET DETAILED ANALYTICS PAGE DATA ---
// @route   GET /api/analytics/details
// @desc    Get data for the dedicated Analytics page (charts, tables)
// @access  Private (Maybe Admin only? Adjust middleware)
router.get('/details', protect, async (req, res) => {
    try {
        const today = new Date();
        const twelveMonthsAgo = new Date(new Date().setMonth(today.getMonth() - 12));
        const ninetyDaysAgo = new Date(new Date().setDate(today.getDate() - 90));

        const [
            salesTrendData,
            topProductsChartData,
            revenueSummaryData, // Reuse calculations from dashboard or re-calculate
            recentInvoicesTableData // More detailed than dashboard
        ] = await Promise.all([
            // Sales Trend (Last 12 Months by Month)
            Invoice.aggregate([
                { $match: { createdAt: { $gte: twelveMonthsAgo } } },
                { $group: {
                    _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
                    totalSales: { $sum: "$grandTotal" }
                }},
                { $sort: { "_id.year": 1, "_id.month": 1 } },
                { $project: {
                     _id: 0,
                     label: { $concat: [ { $arrayElemAt: [ ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], "$_id.month" ] }, " ", { $toString: "$_id.year" } ] },
                     sales: "$totalSales"
                 }}
            ]),
            // Top 5 Products Chart Data (Units, Last 90 days)
            Invoice.aggregate([
                 { $match: { createdAt: { $gte: ninetyDaysAgo } } },
                 { $unwind: '$items' },
                 { $group: { _id: '$items.product', totalQuantity: { $sum: '$items.quantity' } } },
                 { $sort: { totalQuantity: -1 } }, { $limit: 5 },
                 { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'productInfo', pipeline: [ { $project: { name: 1, sku: 1 } } ] } },
                 { $unwind: '$productInfo' },
                 { $project: { _id: 0, name: '$productInfo.name', quantitySold: '$totalQuantity' } } // Data for Pie Chart
            ]),
            // Revenue Summary (Re-calculate for consistency or fetch if stored)
             Invoice.aggregate([
                { $group: {
                    _id: null,
                    revenueToday: { $sum: { $cond: [ { $gte: ["$createdAt", getStartOfDay(today)] }, "$grandTotal", 0 ] } },
                    revenueThisMonth: { $sum: { $cond: [ { $gte: ["$createdAt", getStartOfMonth(today)] }, "$grandTotal", 0 ] } },
                    totalRevenue: { $sum: "$grandTotal" }
                }},
                 { $project: { _id: 0 } } // Exclude the null _id
            ]),
            // Recent Invoices Table Data (More details, maybe more items)
            Invoice.find({})
                    .sort({createdAt: -1})
                    .limit(20) // Fetch more for a table
                    .populate('createdBy', 'name') // Populate user name
                    .select('invoiceNumber customerName createdAt grandTotal createdBy') // Select fields
        ]);

        // Format revenue summary (handle case where no invoices exist)
        const summary = revenueSummaryData.length > 0 ? revenueSummaryData[0] : { revenueToday: 0, revenueThisMonth: 0, totalRevenue: 0 };

        res.json({
            salesTrend: salesTrendData,
            topProductsChart: topProductsChartData,
            revenueSummary: {
                today: summary.revenueToday.toFixed(2),
                thisMonth: summary.revenueThisMonth.toFixed(2),
                allTime: summary.totalRevenue.toFixed(2),
            },
            recentInvoices: recentInvoicesTableData
        });

    } catch (error) {
        console.error('Error fetching detailed analytics data:', error);
        res.status(500).json({ message: 'Server error fetching detailed analytics' });
    }
});


// --- GET LOW STOCK PREDICTION (Example using Average Rate) ---
// @route   GET /api/analytics/low-stock-prediction/:productId
// @desc    Predict when a product might reach its low stock threshold based on recent sales
// @access  Private
router.get('/low-stock-prediction/:productId', protect, async (req, res) => {
    const { productId } = req.params;
    const lookbackDays = 30; // Configurable: Days of sales history to consider

    try {
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: 'Invalid product ID format' });
        }
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const currentStock = product.currentStock;
        const threshold = product.lowStockThreshold;

        if (currentStock <= threshold) {
             return res.json({ message: `Product is already at or below the low stock threshold (${threshold}).`, predictionDate: null, daysLeft: 0 });
        }

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - lookbackDays);

        // Find total quantity sold in the lookback period
        const salesData = await Invoice.aggregate([
            { $match: { createdAt: { $gte: startDate }, 'items.product': product._id } },
            { $unwind: '$items' },
            { $match: { 'items.product': product._id } }, // Ensure only this product's items are counted
            { $group: { _id: null, totalSold: { $sum: '$items.quantity' } } }
        ]);

        const totalSold = salesData.length > 0 ? salesData[0].totalSold : 0;

        if (totalSold <= 0) {
            return res.json({ message: `No sales recorded for this product in the last ${lookbackDays} days. Cannot predict.`, predictionDate: null, daysLeft: null });
        }

        // --- Simple Average Calculation ---
        const averageDailySales = totalSold / lookbackDays;
        if (averageDailySales <= 0) { // Should not happen if totalSold > 0, but safety check
             return res.json({ message: `Average daily sales are zero or negative. Cannot predict depletion.`, predictionDate: null, daysLeft: null });
        }

        const stockAvailableAboveThreshold = currentStock - threshold;
        const daysLeft = Math.floor(stockAvailableAboveThreshold / averageDailySales);

        if (!isFinite(daysLeft) || daysLeft < 0) {
             // Handle cases where prediction might be immediate or calculation is strange
             console.warn(`Unusual prediction result for ${productId}: daysLeft=${daysLeft}`);
             return res.json({ message: `Predicted to reach threshold very soon or calculation result invalid.`, predictionDate: new Date(), daysLeft: 0 });
        }

        const predictionDate = new Date();
        predictionDate.setDate(predictionDate.getDate() + daysLeft);

        res.json({
            message: `Based on average sales over the last ${lookbackDays} days (${averageDailySales.toFixed(2)}/day), predicted to reach threshold (${threshold}) in approximately ${daysLeft} days.`,
            predictionDate: predictionDate.toISOString().split('T')[0], // Format YYYY-MM-DD
            daysLeft: daysLeft,
            averageDailySales: averageDailySales.toFixed(2)
        });

    } catch (error) {
        console.error(`Error predicting low stock for product ${productId}:`, error);
        res.status(500).json({ message: 'Server error during low stock prediction' });
    }
});

module.exports = router;