/*const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

connectDB();

// Initialize Express
const app = express();

// Middleware
app.use(express.json());
app.use(cors());


console.log(require('./routes/productRoutes')); 

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/invoices', require('./routes/invoiceRoutes'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

// Set up server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});*/




/*const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Load environment variables
dotenv.config();

// Debugging: Ensure environment variables are loaded
console.log('🔄 Loaded ENV Variables:', process.env.MONGO_URI, process.env.JWT_SECRET);

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log('⏳ Attempting MongoDB Connection...');
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error:`, error);
    process.exit(1);
  }
};

connectDB();

// Initialize Express
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Debugging: Log incoming requests to check if requests reach Express
app.use((req, res, next) => {
  console.log(`🔍 Incoming Request: ${req.method} ${req.url}`);
  next();
});

app.post('/test-register', (req, res) => {
    console.log('🚀 Test Register Route Hit in index.js');
    res.json({ message: '✅ Index.js route executed successfully!' });
  });
  

// Debugging: Verify Routes Registration
console.log('🔄 Importing Routes...');
console.log('Auth Routes:', require('./routes/authRoutes'));
console.log('User Routes:', require('./routes/userRoutes'));
console.log('Product Routes:', require('./routes/productRoutes'));
console.log('Invoice Routes:', require('./routes/invoiceRoutes'));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/invoices', require('./routes/invoiceRoutes'));

console.log('✅ Routes Registered');

// Test route directly in index.js to ensure server works
app.get('/test', (req, res) => {
  console.log('🚀 Test Route Hit in index.js');
  res.json({ message: 'Index.js test route is working!' });
});

// Debugging: Check if Server Starts Properly
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});*/

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Load environment variables
dotenv.config();

// Debugging: Ensure environment variables are loaded
console.log('✅ Loaded ENV Variables:', process.env.MONGO_URI ? 'MONGO_URI SET' : 'MONGO_URI MISSING', process.env.JWT_SECRET ? 'JWT_SECRET SET' : 'JWT_SECRET MISSING');

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log('⏳ Attempting MongoDB Connection...');
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI environment variable is not defined.');
    }
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error:`, error.message);
    process.exit(1);
  }
};

connectDB();

// Initialize Express
const app = express();

// Middleware
app.use(express.json()); // Body parser for JSON format
app.use(cors());         // Enable Cross-Origin Resource Sharing

// Debugging: Log incoming requests
app.use((req, res, next) => {
  console.log(`➡️ Incoming Request: ${req.method} ${req.url}`);
  next();
});


// --- API Routes ---
console.log('⚙️ Registering Routes...');
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/invoices', require('./routes/invoiceRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes')); // <-- ADDED ANALYTICS ROUTE
console.log('✅ Routes Registered');
// --- End API Routes ---


// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  console.log('🚀 Running in production mode. Serving static files...');
  // Set static folder
  app.use(express.static(path.join(__dirname, 'client/build')));

  // Serve frontend index.html file on all non-API routes
  app.get('*', (req, res) => {
        // Ensure API requests don't get overwritten by this catch-all
        if (!req.originalUrl.startsWith('/api')) {
             res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
        } else {
             // Optional: Handle API routes not found more explicitly
             res.status(404).json({ message: 'API endpoint not found.' });
        }
    }
  );
} else {
    // Simple test route for development
    app.get('/', (req, res) => {
        res.send('API is running in development mode...');
    });
}


// Set up server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ Server running on port ${PORT}`)
);


