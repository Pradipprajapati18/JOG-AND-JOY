import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useOrdersList } from '../queries/useOrders';
import { useSettingsContext } from '../context/SettingsContext';

export default function Invoice() {
  const { orderId } = useParams();
  const searchParams = new URLSearchParams(window.location.search);
  const isPackingSlip = searchParams.get('type') === 'packing_slip';
  const { data: ordersData, isLoading } = useOrdersList({ pageSize: 1000 });
  const { settings } = useSettingsContext();

  const order = ordersData?.data?.find(
    (o) => String(o.id) === String(orderId) || String(o.orderNumber) === String(orderId)
  );

  if (isLoading) return <div className="p-10 text-center font-bold">Generating {isPackingSlip ? 'Packing Slip' : 'Invoice'}...</div>;
  if (!order) return <Navigate to="/" />;

  const subtotal = order.items?.reduce((acc, item) => acc + ((item.price || 0) * (item.quantity || 1)), 0) || 0;
  
  // Use shipping charge from settings so it dynamically updates for all invoices
  const shippingCharge = settings?.baseShippingRate || 0;
  
  // Notice we don't apply taxes here as the new packing slip doesn't specify it, but you could add it back easily.
  const total = subtotal + shippingCharge;

  // Format date helper for DD/MM/YYYY
  const formatSimpleDate = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 flex justify-center font-sans">
      <div className="w-full max-w-4xl bg-white shadow-2xl p-8 md:p-12 relative text-black">
        {/* Header Action (Hidden when printing) */}
        <div className="absolute top-4 right-4 flex justify-end print:hidden">
          <button
            onClick={() => window.print()}
            className="px-6 py-2 bg-slate-900 text-white font-bold text-sm rounded-lg hover:bg-slate-800 transition-colors shadow-md"
          >
            Print / Download PDF
          </button>
        </div>

        {/* Invoice Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-black mb-1">JOG & JOY</h1>
          <p className="text-xl text-gray-700">{isPackingSlip ? 'Packing Slip' : 'Invoice'}</p>
          
          <div className="mt-8 text-lg">
            <p>49, Kamal House, Pankaj Society, Paldi,</p>
            <p>Ahmedabad - 380007, Gujarat, India.</p>
            <p className="mt-6">+91 94299 05118</p>
          </div>
        </div>

        {/* Customer & Shipping Details */}
        <div className="grid grid-cols-2 gap-8 mb-8 items-end">
          <div>
            <h3 className="text-xl font-bold mb-2">Ship To:</h3>
            <p className="text-lg">{order.shippingAddress?.name || 'Customer'}</p>
            <p className="text-lg">{order.shippingAddress?.city}</p>
            <p className="text-lg">{order.shippingAddress?.city}, {order.shippingAddress?.state || 'Gujarat'} {order.shippingAddress?.postalCode}</p>
          </div>
          
          <div className="text-xl flex flex-col gap-1 justify-end pl-12">
            <div className="flex gap-2">
              <span className="font-bold w-32">Order id:</span>
              <span>#{order.orderNumber || order.id.substring(0, 8).toUpperCase()}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-bold w-32">Order date:</span>
              <span>{formatSimpleDate(order.createdAt)}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-bold w-32">user:</span>
              <span>{order.user?.name || order.shippingAddress?.name || ''}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-bold w-32">ship date:</span>
              <span></span>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-4">
          <table className="w-full text-center border-collapse border-[3px] border-black">
            <thead>
              <tr className="bg-[#1A1A1A] text-white">
                <th className="py-2 px-2 border border-slate-700 font-bold text-sm w-[20%]">Item</th>
                <th className="py-2 px-2 border border-slate-700 font-bold text-sm w-[35%]">Description</th>
                <th className="py-2 px-2 border border-slate-700 font-bold text-sm w-[15%]">Price</th>
                <th className="py-2 px-2 border border-slate-700 font-bold text-sm w-[15%]">Quantity</th>
                <th className="py-2 px-2 border border-slate-700 font-bold text-sm w-[15%]">Ext. Price</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, index) => (
                <tr key={index}>
                  <td className="py-3 px-2 border-[3px] border-black text-sm font-medium">
                    {item.titleSnapshot || item.name || 'Product'}
                  </td>
                  <td className="py-3 px-2 border-[3px] border-black text-sm whitespace-pre-line text-center">
                    {item.color && <div>colour: {item.color}</div>}
                    {item.size && <div>size: {item.size}</div>}
                  </td>
                  <td className="py-3 px-2 border-[3px] border-black text-sm">{item.price || 0} rs</td>
                  <td className="py-3 px-2 border-[3px] border-black text-sm">{item.quantity || 1}</td>
                  <td className="py-3 px-2 border-[3px] border-black text-sm">{(item.price || 0) * (item.quantity || 1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-16">
          <div className="w-80">
            <div className="flex justify-end items-center gap-4 mb-1 pr-6">
              <span className="font-bold text-2xl">Sub total:</span>
              <span className="font-bold text-2xl w-24 text-right">{subtotal}</span>
            </div>
            <div className="flex justify-end items-center gap-4 mb-2 pr-6">
              <span className="font-bold text-2xl">shipping:</span>
              <span className="font-bold text-2xl w-24 text-right">{shippingCharge}</span>
            </div>
            <div className="border-t-[4px] border-black my-2"></div>
            <div className="flex justify-end items-center gap-4 mt-2 pr-6">
              <span className="font-bold text-2xl">Total:</span>
              <span className="font-bold text-2xl w-24 text-right">{total}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Global Print Styles (Only applied on this page when printing) */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          body * { visibility: hidden; }
          .min-h-screen { background-color: white !important; }
          .min-h-screen > div, .min-h-screen > div * { visibility: visible; }
          .min-h-screen > div { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none; padding: 0; margin: 0; }
          @page { margin: 0.5cm; size: auto; }
        }
      `}} />
    </div>
  );
}
