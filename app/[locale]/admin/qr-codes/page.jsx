'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Trash2, QrCode, Download, Loader2, ExternalLink, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { QRCodeCanvas } from 'qrcode.react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';

export default function QRCodesPage() {
    const [codes, setCodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newCode, setNewCode] = useState({ code: '', description: '' });
    const [creating, setCreating] = useState(false);
    const [mode, setMode] = useState('generate');
    const [file, setFile] = useState(null);
    const [selectedQrId, setSelectedQrId] = useState(null);

    useEffect(() => {
        fetchCodes();
    }, []);

    const fetchCodes = async () => {
        try {
            const res = await fetch('/api/admin/qr-codes');
            if (!res.ok) throw new Error('Failed to fetch codes');
            const data = await res.json();
            setCodes(data);
        } catch (error) {
            toast.error('Failed to load QR codes');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setCreating(true);

        try {
            let imageUrl = null;

            if (mode === 'upload' && file) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('bucket', 'qr-codes');

                const uploadRes = await fetch('/api/admin/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!uploadRes.ok) {
                    const error = await uploadRes.json();
                    throw new Error(error.error || 'Failed to upload image');
                }

                const uploadData = await uploadRes.json();
                imageUrl = uploadData.url;
            }

            const res = await fetch('/api/admin/qr-codes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newCode, image_url: imageUrl }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to create code');
            }

            toast.success('QR Code created successfully');
            setIsCreateOpen(false);
            setNewCode({ code: '', description: '' });
            setFile(null);
            setMode('generate');
            fetchCodes();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this QR code?')) return;

        try {
            const res = await fetch(`/api/admin/qr-codes/${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Failed to delete code');

            toast.success('QR Code deleted');
            fetchCodes();
        } catch (error) {
            toast.error('Failed to delete code');
        }
    };

    const downloadQR = (code, imageUrl) => {
        if (imageUrl) {
            // Download uploaded image
            const link = document.createElement('a');
            link.href = imageUrl;
            link.download = `qr-${code}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            // Download generated canvas
            const canvas = document.getElementById(`qr-${code}`);
            if (canvas) {
                const pngUrl = canvas
                    .toDataURL("image/png")
                    .replace("image/png", "image/octet-stream");
                let downloadLink = document.createElement("a");
                downloadLink.href = pngUrl;
                downloadLink.download = `qr-${code}.png`;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            }
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">QR Code Manager</h1>
                    <p className="text-muted-foreground">Create and track QR code campaigns</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Create New Code
                </Button>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New QR Code</DialogTitle>
                        </DialogHeader>

                        <Tabs value={mode} onValueChange={setMode} className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="generate">Generate System QR</TabsTrigger>
                                <TabsTrigger value="upload">Upload Custom QR</TabsTrigger>
                            </TabsList>

                            <form onSubmit={handleCreate} className="space-y-4 mt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="code">Code (Slug)</Label>
                                    <Input
                                        id="code"
                                        placeholder="e.g., summer-promo"
                                        value={newCode.code}
                                        onChange={(e) => setNewCode({ ...newCode, code: e.target.value })}
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        This will be used in the URL: ?qr_code=YOUR_CODE
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Input
                                        id="description"
                                        placeholder="Campaign description"
                                        value={newCode.description}
                                        onChange={(e) => setNewCode({ ...newCode, description: e.target.value })}
                                    />
                                </div>

                                <TabsContent value="upload">
                                    <div className="space-y-2">
                                        <Label htmlFor="file">Upload QR Image</Label>
                                        <Input
                                            id="file"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setFile(e.target.files[0])}
                                            required={mode === 'upload'}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Make sure your custom QR code points to: <br />
                                            <span className="font-mono bg-muted px-1 rounded">
                                                https://www.barakasrl.it/?qr_code={newCode.code || 'YOUR_CODE'}
                                            </span>
                                        </p>
                                    </div>
                                </TabsContent>

                                <Button type="submit" className="w-full" disabled={creating}>
                                    {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Create Code'}
                                </Button>
                            </form>
                        </Tabs>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Active Campaigns</CardTitle>
                    <CardDescription>Manage your QR codes and view scan statistics</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>QR Code</TableHead>
                                    <TableHead>Code / Slug</TableHead>
                                    <TableHead>Target URL</TableHead>
                                    <TableHead>Scans</TableHead>
                                    <TableHead>Created At</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {codes.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            No QR codes created yet
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    codes.map((item) => (
                                        <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedQrId(item.id)}>
                                            <TableCell>
                                                <div className="bg-white p-2 w-fit rounded border">
                                                    {item.image_url ? (
                                                        <img
                                                            src={item.image_url}
                                                            alt={item.code}
                                                            className="w-16 h-16 object-contain"
                                                        />
                                                    ) : (
                                                        <QRCodeCanvas
                                                            id={`qr-${item.code}`}
                                                            value={item.target_url}
                                                            size={64}
                                                            level={"H"}
                                                        />
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{item.code}</div>
                                                <div className="text-xs text-muted-foreground">{item.description}</div>
                                            </TableCell>
                                            <TableCell className="max-w-[200px] truncate">
                                                <a
                                                    href={item.target_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center text-blue-500 hover:underline text-xs"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {item.target_url}
                                                    <ExternalLink className="ml-1 h-3 w-3" />
                                                </a>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-bold text-lg">{item.scan_count}</div>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(item.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); downloadQR(item.code, item.image_url); }}>
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <QRDetailsSheet id={selectedQrId} open={!!selectedQrId} onOpenChange={(open) => !open && setSelectedQrId(null)} />
        </div >
    );
}

function QRDetailsSheet({ id, open, onOpenChange }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (id && open) {
            setLoading(true);
            fetch(`/api/admin/qr-codes/${id}`)
                .then(res => res.json())
                .then(setData)
                .catch(() => toast.error('Failed to load details'))
                .finally(() => setLoading(false));
        }
    }, [id, open]);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>QR Code Details</SheetTitle>
                    <SheetDescription>Detailed scan history and statistics</SheetDescription>
                </SheetHeader>

                {loading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : data ? (
                    <div className="space-y-6 mt-6">
                        <div className="flex items-start gap-4">
                            <div className="bg-white p-2 w-fit rounded border">
                                {data.image_url ? (
                                    <img src={data.image_url} alt={data.code} className="w-24 h-24 object-contain" />
                                ) : (
                                    <QRCodeCanvas value={data.target_url} size={96} level={"H"} />
                                )}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold">{data.code}</h3>
                                <p className="text-sm text-muted-foreground">{data.description}</p>
                                <a href={data.target_url} target="_blank" className="text-xs text-blue-500 hover:underline break-all mt-1 block">
                                    {data.target_url}
                                </a>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-2xl font-bold">{data.scans?.length || 0}</div>
                                    <p className="text-xs text-muted-foreground">Total Scans (Recent)</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-2xl font-bold">
                                        {new Set(data.scans?.map(s => s.ip_address)).size}
                                    </div>
                                    <p className="text-xs text-muted-foreground">Unique IPs</p>
                                </CardContent>
                            </Card>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-3">Recent Scans</h4>
                            <div className="border rounded-md">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Time</TableHead>
                                            <TableHead>IP Address</TableHead>
                                            <TableHead>Device</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.scans?.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={3} className="text-center text-muted-foreground">No scans yet</TableCell>
                                            </TableRow>
                                        ) : (
                                            data.scans?.map((scan) => (
                                                <TableRow key={scan.id}>
                                                    <TableCell className="text-xs">
                                                        {new Date(scan.scanned_at).toLocaleString()}
                                                    </TableCell>
                                                    <TableCell className="text-xs font-mono">
                                                        {scan.ip_address}
                                                    </TableCell>
                                                    <TableCell className="text-xs truncate max-w-[150px]" title={scan.user_agent}>
                                                        {scan.user_agent?.split(')')[0] + ')' || 'Unknown'}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>
                ) : null}
            </SheetContent>
        </Sheet>
    );
}
