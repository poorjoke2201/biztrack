// routes/analyticsRoutes.js (Backend - Complete and Updated with last7DaysSales in dashboard summary)
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { protect, admin } = require('../middleware/authMiddleware'); // Assuming path is correct
const Invoice = require('../models/Invoice'); // Assuming path is correct
const Product = require('../models/Product'); // Assuming path is correct
// Remove 'regression' if not used: const regression = require('regression');

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
// @desc    Get summary data for dashboard cards, lists, and mini sales trend
// @access  Private (Accessible to logged-in users, typically not admin-only for summary)
router.get('/dashboard-summary', protect, async (req, res) => {
    console.log("GET /api/analytics/dashboard-summary: Request received.");
    try {
        const today = new Date();
        const startOfToday = getStartOfDay(today);
        const startOfMonth = getStartOfMonth(today);
        const ninetyDaysAgo = new Date(new Date().setDate(today.getDate() - 90));
        const sevenDaysAgo = new Date(new Date().setDate(today.getDate() - 7)); // For mini sales trend

        // Use Promise.all for concurrent queries
        const [
            totalProductCount,
            outOfStockCount,
            lowStockProducts, // Fetched for alerts and count
            revenueTodayData,
            revenueThisMonthData,
            totalRevenueData,
            topSellingProductsData,
            lowestSellingProductsData,
            recentInvoicesData,
            last7DaysSalesData // *** Data for dashboard mini chart ***
        ] = await Promise.all([
            Product.countDocuments(),
            Product.countDocuments({ currentStock: { $lte: 0 } }),
            Product.find({
                $expr: { $lte: ["$currentStock", "$lowStockThreshold"] },
                currentStock: { $gt: 0 } // Only those actually in stock but low
            }).limit(10).select('name currentStock lowStockThreshold sku _id'), // Include _id for productId in alert
            Invoice.aggregate([
                { $match: { createdAt: { $gte: startOfToday }, status: 'Active' } },
                { $group: { _id: null, total: { $sum: '$grandTotal' } } }
            ]),
            Invoice.aggregate([
                { $match: { createdAt: { $gte: startOfMonth }, status: 'Active' } },
                { $group: { _id: null, total: { $sum: '$grandTotal' } } }
            ]),
            Invoice.aggregate([
                { $match: { status: 'Active' } },
                { $group: { _id: null, total: { $sum: '$grandTotal' } } }
            ]),
            Invoice.aggregate([ // Top Selling Products
                 { $match: { createdAt: { $gte: ninetyDaysAgo }, status: 'Active' } },
                 { $unwind: '$items' },
                 { $group: { _id: '$items.product', totalQuantity: { $sum: '$items.quantity' } } },
                 { $sort: { totalQuantity: -1 } }, { $limit: 5 },
                 { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'productDetails', pipeline: [ { $project: { name: 1 } } ] } },
                 { $unwind: '$productDetails' },
                 { $project: { _id: 1, name: '$productDetails.name', quantity: '$totalQuantity' } }
            ]),
            Invoice.aggregate([ // Lowest Selling Products
                 { $match: { createdAt: { $gte: ninetyDaysAgo }, status: 'Active' } },
                 { $unwind: '$items' },
                 { $group: { _id: '$items.product', totalQuantity: { $sum: '$items.quantity' } } },
                 { $sort: { totalQuantity: 1 } }, { $limit: 5 },
                 { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'productDetails', pipeline: [ { $project: { name: 1 } } ] } },
                 { $unwind: '$productDetails' },
                 { $project: { _id: 1, name: '$productDetails.name', quantity: '$totalQuantity' } }
            ]),
            Invoice.find({ status: 'Active' })
                    .sort({createdAt: -1})
                    .limit(5) // Recent 5 invoices
                    .select('invoiceNumber customerName createdAt grandTotal _id'), // Select fields
            // *** Query for Last 7 Days Sales ***
            Invoice.aggregate([
                { $match: { createdAt: { $gte: sevenDaysAgo }, status: 'Active' } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, // Group by day
                        totalSales: { $sum: '$grandTotal' }
                    }
                },
                { $sort: { "_id": 1 } }, // Sort by date
                { $project: { _id: 0, label: '$_id', sales: '$totalSales' } } // Format for chart
            ])
        ]);

        // Process fetched data
        const revenueToday = revenueTodayData.length > 0 ? revenueTodayData[0].total : 0;
        const revenueThisMonth = revenueThisMonthData.length > 0 ? revenueThisMonthData[0].total : 0;
        const totalRevenue = totalRevenueData.length > 0 ? totalRevenueData[0].total : 0;

        // Generate Alerts
        const alerts = [];
        lowStockProducts.forEach(p => {
            alerts.push({
                type: 'LowStock',
                message: `Low stock: ${p.name} (SKU: ${p.sku}) - ${p.currentStock} left (Threshold: ${p.lowStockThreshold})`,
                productId: p._id
            });
        });
        // Optionally add out-of-stock alerts directly here if `outOfStockCount` isn't enough
        if (outOfStockCount > 0) {
            const outOfStockProds = await Product.find({ currentStock: { $lte: 0 } }).limit(3).select('name sku _id'); // Get a few examples
            outOfStockProds.forEach(p => {
                alerts.push({
                    type: 'OutOfStock',
                    message: `${p.name} (SKU: ${p.sku}) is OUT OF STOCK!`,
                    productId: p._id
                });
            });
        }

        console.log("Dashboard Summary - Prepared Data:", { last7DaysSales: last7DaysSalesData });

        // Send response
        res.json({
            productCount: totalProductCount,
            outOfStockCount: outOfStockCount,
            lowStockCount: lowStockProducts.length, // Actual count of low stock items found
            revenueToday: revenueToday.toFixed(2),
            revenueThisMonth: revenueThisMonth.toFixed(2),
            totalRevenue: totalRevenue.toFixed(2),
            topSellingProducts: topSellingProductsData,
            lowestSellingProducts: lowestSellingProductsData,
            recentInvoices: recentInvoicesData,
            alerts: alerts,
            last7DaysSales: last7DaysSalesData // *** Ensure this is included in the response ***
        });

    } catch (error) {
        console.error('Error fetching dashboard summary data:', error);
        res.status(500).json({ message: 'Server error fetching dashboard summary' });
    }
});


// --- GET DETAILED ANALYTICS PAGE DATA ---
// @route   GET /api/analytics/details
// @desc    Get data for the dedicated Analytics page
// @access  Private (Consider Admin Only by adding 'admin' middleware)
router.get('/details', protect, /* admin, */ async (req, res) => {
    console.log("GET /api/analytics/details: Request received.");
    try {
        const today = new Date();
        const twelveMonthsAgo = new Date(new Date().setMonth(today.getMonth() - 12));
        const ninetyDaysAgo = new Date(new Date().setDate(today.getDate() - 90));

        const [
            salesTrendData,
            topProductsChartData,
            revenueSummaryData,
            recentInvoicesTableData,
            // Example: Sales by Category data
            // salesByCategoryData
        ] = await Promise.all([
            // Sales Trend (Last 12 Months by Month)
            Invoice.aggregate([
                { $match: { createdAt: { $gte: twelveMonthsAgo }, status: 'Active' } },
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
                 { $match: { createdAt: { $gte: ninetyDaysAgo }, status: 'Active' } },
                 { $unwind: '$items' },
                 { $group: { _id: '$items.product', totalQuantity: { $sum: '$items.quantity' } } },
                 { $sort: { totalQuantity: -1 } }, { $limit: 5 },
                 { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'productInfo', pipeline: [ { $project: { name: 1, sku: 1 } } ] } },
                 { $unwind: '$productInfo' },
                 { $project: { _id: 0, name: '$productInfo.name', quantitySold: '$totalQuantity' } }
            ]),
            // Revenue Summary (Same logic as dashboard, could be a shared helper)
             Invoice.aggregate([
                { $match: { status: 'Active' } },
                { $group: {
                    _id: null,
                    revenueToday: { $sum: { $cond: [ { $gte: ["$createdAt", getStartOfDay(today)] }, "$grandTotal", 0 ] } },
                    revenueThisMonth: { $sum: { $cond: [ { $gte: ["$createdAt", getStartOfMonth(today)] }, "$grandTotal", 0 ] } },
                    totalRevenue: { $sum: "$grandTotal" }
                }},
                 { $project: { _id: 0 } }
            ]),
            // Recent Invoices Table Data (More items for details page)
            Invoice.find({ status: 'Active' })
                    .sort({createdAt: -1})
                    .limit(20) // Fetch more for a table
                    .populate('createdBy', 'name')
                    .select('invoiceNumber customerName createdAt grandTotal createdBy _id')
        ]);

        const summary = revenueSummaryData.length > 0 ? revenueSummaryData[0] : { revenueToday: 0, revenueThisMonth: 0, totalRevenue: 0 };

        res.json({
            salesTrend: salesTrendData,
            topProductsChart: topProductsChartData,
            revenueSummary: {
                today: Number(summary.revenueToday).toFixed(2),
                thisMonth: Number(summary.revenueThisMonth).toFixed(2),
                allTime: Number(summary.totalRevenue).toFixed(2),
            },
            recentInvoices: recentInvoicesTableData
        });

    } catch (error) {
        console.error('Error fetching detailed analytics data:', error);
        res.status(500).json({ message: 'Server error fetching detailed analytics' });
    }
});


// --- GET LOW STOCK PREDICTION ---
// @route   GET /api/analytics/low-stock-prediction/:productId
// @desc    Predict when a product might reach its low stock threshold
// @access  Private
router.get('/low-stock-prediction/:productId', protect, async (req, res) => {
    // ... (logic for this remains the same as your provided version) ...
    const { productId } = req.params;
    const lookbackDays = 30;
    try {
        if (!mongoose.Types.ObjectId.isValid(productId)) return res.status(400).json({ message: 'Invalid product ID format' });
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        const {currentStock, lowStockThreshold} = product;
        if (currentStock <= lowStockThreshold) return res.json({ message: `Product at/below threshold.`, predictionDate: null, daysLeft: 0 });
        const startDate = new Date(new Date().setDate(new Date().getDate() - lookbackDays));
        const salesData = await Invoice.aggregate([
            { $match: { createdAt: { $gte: startDate }, 'items.product': new mongoose.Types.ObjectId(productId), status: 'Active' } }, // Cast to ObjectId
            { $unwind: '$items' }, { $match: { 'items.product': new mongoose.Types.ObjectId(productId) } },
            { $group: { _id: null, totalSold: { $sum: '$items.quantity' } } }
        ]);
        const totalSold = salesData.length > 0 ? salesData[0].totalSold : 0;
        if (totalSold <= 0) return res.json({ message: `No sales in last ${lookbackDays} days.`, predictionDate: null, daysLeft: null });
        const averageDailySales = totalSold / lookbackDays;
        if (averageDailySales <= 0) return res.json({ message: `Avg daily sales zero/negative.`, predictionDate: null, daysLeft: null });
        const stockAvailableAboveThreshold = currentStock - lowStockThreshold;
        const daysLeft = Math.floor(stockAvailableAboveThreshold / averageDailySales);
        if (!isFinite(daysLeft) || daysLeft < 0) return res.json({ message: `Prediction invalid.`, predictionDate: new Date(), daysLeft: 0 });
        const predictionDate = new Date(); predictionDate.setDate(predictionDate.getDate() + daysLeft);
        res.json({ message: `Based on average sales over the last ${lookbackDays} days (${averageDailySales.toFixed(2)}/day), predicted to reach threshold (${lowStockThreshold}) in approx ${daysLeft} days.`, predictionDate: predictionDate.toISOString().split('T')[0], daysLeft, averageDailySales: averageDailySales.toFixed(2) });
    } catch (error) {
        console.error(`Error predicting low stock for product ${productId}:`, error);
        res.status(500).json({ message: 'Server error during low stock prediction' });
    }
});

module.exports = router;