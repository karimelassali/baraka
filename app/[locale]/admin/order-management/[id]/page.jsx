'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import OrderEditor from '@/components/admin/orders/OrderEditor';

export default function OrderEditorPage() {
    const params = useParams();
    const id = params.id;

    return <OrderEditor orderId={id} />;
}
