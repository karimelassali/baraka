import { redirect } from 'next/navigation';

export async function GET(request, { params }) {
    const { id } = await params;
    // Redirect to the full offer page (defaulting to 'it' locale if not specified, or handle detection)
    // Using 307 Temporary Redirect or 301 Permanent? 
    // Since ID is stable, 301 is better, but maybe we want analytics later.
    return redirect(`/it/offers/${id}`);
}
