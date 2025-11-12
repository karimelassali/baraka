// components/admin/CustomerManagement.jsx
"use client";

import { useEffect, useState } from 'react';
import EditCustomer from './EditCustomer';

function SkeletonRow() {
  return (
    <tr>
      <td className="p-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
      </td>
      <td className="p-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
      </td>
      <td className="p-2">
        <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
      </td>
    </tr>
  );
}


export default function CustomerManagement() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: '', country: '', residence: '' });
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      const params = new URLSearchParams(filters);
      try {
        const response = await fetch(`/api/admin/customers?${params.toString()}`);
        const data = await response.json();

        if (response.ok) {
          setCustomers(data);
        } else {
          console.error('Failed to fetch customers:', data.error);
        }
      } catch (error) {
        console.error('An error occurred while fetching customers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (updatedCustomer) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c))
    );
  };

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold">Customer Management</h2>
      <div className="mt-4">
        <input name="name" placeholder="Name" value={filters.name} onChange={handleFilterChange} />
        <input name="country" placeholder="Country" value={filters.country} onChange={handleFilterChange} />
        <input name="residence" placeholder="Residence" value={filters.residence} onChange={handleFilterChange} />
      </div>
      <div className="mt-4">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : (
              customers.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.first_name} {customer.last_name}</td>
                  <td>{customer.email}</td>
                  <td>
                    <button onClick={() => setSelectedCustomer(customer)}>Edit</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {selectedCustomer && (
        <EditCustomer
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
