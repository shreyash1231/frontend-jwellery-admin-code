import React from 'react';

const supportData = {
  title: 'Support Center',
  message: 'If you need any help, please contact our support team. We are here to assist you with any issues or questions.',
  viewModel: [
    {
      id: 1,
      name: 'Live Chat',
      description: 'Chat with our support team in real-time.'
    },
    {
      id: 2,
      name: 'Email Support',
      description: 'Send us an email and we will respond within 24 hours.'
    },
    {
      id: 3,
      name: 'FAQ',
      description: 'Browse frequently asked questions.'
    }
  ]
};

const Support = () => {
  return (
    <div className="p-6 bg-white rounded shadow-md max-w-lg mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4">{supportData.title}</h2>
      <p className="mb-6 text-gray-700">{supportData.message}</p>
      <div>
        {supportData.viewModel.map(item => (
          <div key={item.id} className="mb-4 p-4 border rounded">
            <h3 className="text-lg font-semibold">{item.name}</h3>
            <p className="text-gray-600">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Support;
