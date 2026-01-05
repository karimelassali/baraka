'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

async function getSupabase() {
    const cookieStore = await cookies();
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                get(name) {
                    return cookieStore.get(name)?.value;
                },
            },
        }
    );
}

export async function getSuppliers() {
    const supabase = await getSupabase();
    const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching suppliers:', error);
        throw new Error('Failed to fetch suppliers');
    }

    return data;
}

export async function createSupplier(supplierData) {
    const supabase = await getSupabase();
    const { data, error } = await supabase
        .from('suppliers')
        .insert([supplierData])
        .select()
        .single();

    if (error) {
        console.error('Error creating supplier:', error);
        throw new Error('Failed to create supplier');
    }

    return data;
}

export async function updateSupplier(id, supplierData) {
    const supabase = await getSupabase();
    const { data, error } = await supabase
        .from('suppliers')
        .update(supplierData)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating supplier:', error);
        throw new Error('Failed to update supplier');
    }

    return data;
}

export async function deleteSupplier(id) {
    const supabase = await getSupabase();
    const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting supplier:', error);

        // Handle Foreign Key Violation (Code 23503)
        if (error.code === '23503') {
            let details = error.details || '';
            let message = 'Impossibile eliminare il fornitore perché è collegato ad altri dati.';

            if (details.includes('slaughtering_records')) {
                message = 'Impossibile eliminare: Questo fornitore ha record nella sezione "Macellazione". Elimina prima i report di macellazione associati.';
            } else if (details.includes('eid_batches')) {
                message = 'Impossibile eliminare: Questo fornitore ha lotti nella sezione "EID / Acquisti". Elimina prima i lotti di acquisto associati.';
            } else if (details.includes('orders')) {
                message = 'Impossibile eliminare: Questo fornitore ha ordini nella sezione "Gestione Ordini". Elimina prima gli ordini associati.';
            } else if (details.includes('inventory_products')) {
                message = 'Impossibile eliminare: Questo fornitore è associato a prodotti in "Inventario". Modifica i prodotti prima di eliminare il fornitore.';
            } else {
                message = `Impossibile eliminare: Il fornitore è ancora utilizzato in altre sezioni del sistema. (Dettagli tecnici: ${details})`;
            }

            throw new Error(message);
        }

        throw new Error('Impossibile eliminare il fornitore. Si è verificato un errore imprevisto.');
    }

    return true;
}
