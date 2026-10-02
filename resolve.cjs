const fs = require('fs');
let txt = fs.readFileSync('src/App.jsx', 'utf8');

const targetStr = `const Home = React.lazy(() => import('./pages/Home'));
const Products = React.lazy(() => import('./pages/Products'));
const ProductDetails = React.lazy(() => import('./pages/ProductDetails'));
const Wishlist = React.lazy(() => import('./pages/Wishlist'));
const Checkout = React.lazy(() => import('./pages/Checkout'));
const Collections = React.lazy(() => import('./pages/Collections'));
const AboutUs = React.lazy(() => import('./pages/AboutUs'));
const ContactUs = React.lazy(() => import('./pages/ContactUs'));
const Invoice = React.lazy(() => import('./pages/Invoice'));
const NotFound = React.lazy(() => import('./pages/NotFound'));
const KidsPage = React.lazy(() => import('./pages/KidsPage'));
const NewArrivalsPage = React.lazy(() => import('./pages/NewArrivalsPage'));
const DistributorNetworkPage = React.lazy(() => import('./pages/DistributorNetworkPage'));
const WhyUs = React.lazy(() => import('./pages/WhyUs'));
const OrderTracking = React.lazy(() => import('./pages/OrderTracking'));
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'));
const CustomerAccount = React.lazy(() => import('./pages/CustomerAccount'));
`;

txt = txt.replace(/<<<<<<< Updated upstream[\s\S]*?=======\r?\n[\s\S]*?>>>>>>> Stashed changes\r?\n/, targetStr);
fs.writeFileSync('src/App.jsx', txt);
