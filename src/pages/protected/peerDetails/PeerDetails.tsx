
"use client";

import { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from '@/components/ui/sheet'; // Import Sheet components
import { BookOpenCheck, Download, MoreVertical, QrCode, Share, Server, Upload, DownloadCloud, Layers, BarChart, Globe } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getAuthToken } from '@/api/getAuthToken';
import { base_path } from '@/api/api';
import { toast } from 'sonner';
import { formatDataSize } from '@/utils/Formater';
import DeleteConfirmationModal from '../peer/components/DeleteConfirmationModel';
import { useUserStore } from '@/global/useUserStore';
import { QRCodeCanvas } from 'qrcode.react';
import { useBreadcrumb } from '@/components/breadcrumb/BreadcrumbContext';
import { useTheme } from 'next-themes';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip as ChartTooltip,
    Legend,
    type ChartOptions,
} from 'chart.js';
import { Input } from '@/components/ui/input'; // Import Input for the form
import { Label } from '@/components/ui/label'; // Import Label for the form

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, ChartTooltip, Legend);

const PeerDetails = () => {
    const { setBreadcrumbs } = useBreadcrumb();
    const { theme } = useTheme();
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useUserStore();
    const [copied, setCopied] = useState(false);
    const ipAddressRef = useRef<HTMLSpanElement>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSheetOpen, setIsSheetOpen] = useState(false); // State for sidesheet
    const [dnsInput, setDnsInput] = useState(''); // State for DNS input
    const [modalContent, setModalContent] = useState<React.ReactNode>(null);
    const queryClient = useQueryClient();
    const [rxHistory, setRxHistory] = useState<number[]>([]);
    const [txHistory, setTxHistory] = useState<number[]>([]);

    useEffect(() => {
        setBreadcrumbs([
            {
                label: (
                    <div className="flex items-center gap-1">
                        <BookOpenCheck className="h-4 w-4" />
                        Peers
                    </div>
                ),
                href: "/Peers",
            },
            {
                label: "Peer-details",
            },
        ]);

        return () => {
            setBreadcrumbs([]);
        };
    }, [setBreadcrumbs]);

    const { data: peerData, isLoading } = useQuery({
        queryKey: ['peer', id],
        queryFn: async () => {
            const authToken = getAuthToken();
            if (!authToken) {
                throw new Error('Authentication token not found. Please log in again.');
            }
            const response = await fetch(`${base_path}/api/peers/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail);
            }
            return response.json();
        },
        refetchInterval: 1000,
    });

    // Update RX/TX history every second
    useEffect(() => {
        if (!peerData) return;
        const interval = setInterval(() => {
            setRxHistory((prev) => [...prev.slice(-8), peerData.rx || 0]);
            setTxHistory((prev) => [...prev.slice(-8), peerData.tx || 0]);
        }, 1000);
        return () => clearInterval(interval);
    }, [peerData]);

    const mutation = useMutation({
        mutationFn: async () => {
            const authToken = getAuthToken();
            const response = await fetch(`${base_path}/api/peers/generate-peer-config/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || 'Failed to generate peer config.');
            }
            return response.text();
        },
    });

    const addDnsMutation = useMutation({
        mutationFn: async (dns: string) => {
            const authToken = getAuthToken();
            const response = await fetch(`${base_path}/api/peers/${id}/dns`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify({ dns }),
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || 'Failed to add DNS.');
            }
            return response.json();
        },
        onSuccess: () => {
            toast.success('DNS added successfully!');
            setIsSheetOpen(false); // Close the sidesheet on success
            setDnsInput(''); // Clear the input
            queryClient.invalidateQueries({ queryKey: ['peer', id] }); // Refresh peer data
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const deleteMutation = useMutation<string | undefined, Error, string | undefined>({
        mutationFn: async (peerId) => {
            const authToken = getAuthToken();
            const response = await fetch(`${base_path}/api/peers/${peerId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || 'Failed to delete peer.');
            }
            return response.json();
        },
        onSuccess: () => {
            toast.success('Peer Deleted Successfully!');
            navigate('/peers');
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const handleCopy = async () => {
        if (!ipAddressRef.current) {
            toast.error('No IP address found to copy');
            return;
        }
        const ipText = ipAddressRef.current.innerText;
        try {
            await navigator.clipboard.writeText(ipText);
            setCopied(true);
            toast.success('IP copied to clipboard');
            setTimeout(() => setCopied(false), 1500);
        } catch (err) {
            const errorMessage = err && typeof err === 'object' && 'message' in err
                ? err.message
                : 'Failed to copy IP address';
            toast.error(typeof errorMessage === 'string' && errorMessage ? errorMessage : 'Failed to copy IP address');
        }
    };

    const handleQRModal = () => {
        mutation.mutate(undefined, {
            onSuccess: (data) => {
                toast.success('Peer Configuration Generated Successfully');
                const formattedData = typeof data === 'string'
                    ? data.replace(/^"|"$/g, '').replace(/\\n/g, '\n')
                    : '';
                const qrContent = (
                    <div className="flex flex-col items-center justify-center p-4 space-y-4">
                        <QRCodeCanvas value={formattedData} size={256} />
                    </div>
                );
                setModalContent(qrContent);
                setIsModalOpen(true);
            },
            onError: (error) => {
                toast.error(error.message);
            },
        });
    };

    const handleDownload = () => {
        mutation.mutate(undefined, {
            onSuccess: (data) => {
                toast.success("Peer File downloaded successfully");
                queryClient.invalidateQueries({ queryKey: ['peers'] });
                const formattedData = typeof data === 'string'
                    ? data.replace(/^"|"$/g, '').replace(/\\n/g, '\n')
                    : '';
                const blob = new Blob([formattedData], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${user.username}_${peerData?.peer_name}.conf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            },
            onError: (error) => {
                toast.error(`Failed to download: ${error.message || error}`);
            },
        });
    };

    const handleConfigModal = () => {
        mutation.mutate(undefined, {
            onSuccess: (data) => {
                toast.success('Peer Configuration Generated Successfully');
                const configContent = (
                    <div className="w-full flex flex-col items-center justify-center p-4">
                        <pre className="text-sm p-4 rounded overflow-auto whitespace-pre-wrap break-words bg-gray-100 dark:bg-gray-800" id="peer-config-content">
                            {typeof data === 'string' ? data.replace(/\\n/g, '\n').replace(/^"|"$/g, '') : data}
                        </pre>
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-4"
                            onClick={async () => {
                                const configText = typeof data === 'string'
                                    ? data.replace(/^"|"$/g, '').replace(/\\n/g, '\n')
                                    : '';
                                try {
                                    await navigator.clipboard.writeText(configText);
                                    toast.success('Configuration copied to clipboard');
                                } catch {
                                    toast.error('Failed to copy configuration');
                                }
                            }}
                        >
                            Copy
                        </Button>
                    </div>
                );
                setModalContent(configContent);
                setIsModalOpen(true);
            },
            onError: (error) => {
                toast.error(error.message);
            },
        });
    };

    const handleDeleteConfirm = () => {
        deleteMutation.mutate(id);
        setIsDeleteModalOpen(false);
    };

    const handleAddDns = () => {
        if (!dnsInput.trim()) {
            toast.error('Please enter a valid DNS address');
            return;
        }
        addDnsMutation.mutate(dnsInput);
    };

    const labels = useMemo(() => Array.from({ length: 9 }, (_, i) => `${i + 1}s`), []);
    const maxVal = useMemo(() => {
        const values = [...rxHistory, ...txHistory].filter((v) => !isNaN(v) && v > 0);
        return values.length ? Math.max(...values) : 1000; // Fallback to avoid zero max
    }, [rxHistory, txHistory]);

    const lineChartOptions: ChartOptions<'line'> = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 1000,
            easing: "easeOutCubic",
        },
        plugins: {
            legend: {
                display: true,
                position: "top",
                labels: {
                    color: theme === "dark" ? "#e5e7eb" : "#1f2937",
                    font: { size: 12 },
                },
            },
            tooltip: {
                enabled: true,
                backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
                titleColor: theme === "dark" ? "#e5e7eb" : "#1f2937",
                bodyColor: theme === "dark" ? "#e5e7eb" : "#1f2937",
                borderColor: theme === "dark" ? "#4b5563" : "#d1d5db",
                borderWidth: 1,
                callbacks: {
                    label: (ctx: any) => {
                        const val = Number(ctx.raw) || 0;
                        const label = ctx.dataset.label;
                        return `${label}: ${formatDataSize(val)}`;
                    },
                },
            },
        },
        scales: {
            x: {
                display: true,
                grid: { display: false },
                ticks: { color: theme === "dark" ? "#9ca3af" : "#6b7280" },
            },
            y: {
                display: true,
                grid: { color: theme === "dark" ? "#374151" : "#e5e7eb" },
                ticks: {
                    color: theme === "dark" ? "#9ca3af" : "#6b7280",
                    callback: function (tickValue: string | number) {
                        return typeof tickValue === "number" ? formatDataSize(tickValue) : tickValue;
                    },
                },
                suggestedMax: maxVal * 1.2,
                beginAtZero: true,
            },
        },
    }), [maxVal, theme]);

    const rxChartData = {
        labels,
        datasets: [
            {
                label: 'RX',
                data: rxHistory.length ? rxHistory : Array(9).fill(0),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                fill: false,
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 0,
            },
        ],
    };

    const txChartData = {
        labels,
        datasets: [
            {
                label: 'TX',
                data: txHistory.length ? txHistory : Array(9).fill(0),
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                fill: false,
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 0,
            },
        ],
    };

    const combinedChartData = {
        labels,
        datasets: [
            {
                label: 'RX',
                data: rxHistory.length ? rxHistory : Array(9).fill(0),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                fill: false,
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 0,
            },
            {
                label: 'TX',
                data: txHistory.length ? txHistory : Array(9).fill(0),
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                fill: false,
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 0,
            },
        ],
    };

    if (isLoading) {
        return <div className="text-center mt-10 text-gray-500 dark:text-gray-400">Loading...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <header className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{peerData?.peer_name}</h1>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        onClick={() => setIsSheetOpen(true)} // Open sidesheet on click
                    >
                        <Globe className='h-4 w-4 text-blue-500' />
                        Add DNS
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        onClick={handleQRModal}
                    >
                        <QrCode className="h-4 w-4 text-blue-500" /> QR Code
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        onClick={() => {
                            setModalContent('Share Content');
                            setIsModalOpen(true);
                        }}
                    >
                        <Share className="h-4 w-4 text-blue-500" /> Share
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        onClick={handleDownload}
                    >
                        <Download className="h-4 w-4 text-blue-500" /> Download
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        onClick={handleConfigModal}
                    >
                        <MoreVertical className="h-4 w-4 text-blue-500" /> Config
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 transition-colors"
                        onClick={() => setIsDeleteModalOpen(true)}
                    >
                        Delete
                    </Button>
                </div>
            </header>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg border-l-4 border-blue-500 hover:shadow-xl transition-shadow duration-300">
                    <div className="p-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Server className="h-5 w-5 text-blue-500" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">IP Address</h3>
                        </div>
                        <div className="flex justify-between items-center">
                            <span ref={ipAddressRef} className="text-lg font-mono text-gray-700 dark:text-gray-300">{peerData?.assigned_ip}</span>
                            <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400" onClick={handleCopy}>
                                {copied ? 'Copied!' : 'Copy'}
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg border-l-4 border-green-500 hover:shadow-xl transition-shadow duration-300">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <DownloadCloud className="h-5 w-5 text-green-500" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Total Received</h3>
                            </div>
                            <Download className="h-7 w-7 text-green-500" />
                        </div>
                        <p className="text-lg text-gray-700 dark:text-gray-300">{formatDataSize(peerData?.rx)}</p>
                    </div>
                </div>
                <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg border-l-4 border-yellow-500 hover:shadow-xl transition-shadow duration-300">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Upload className="h-5 w-5 text-yellow-500" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Total Sent</h3>
                            </div>
                            <Upload className="h-7 w-7 text-yellow-500" />
                        </div>
                        <p className="text-lg text-gray-700 dark:text-gray-300">{formatDataSize(peerData?.tx)}</p>
                    </div>
                </div>
                <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg border-l-4 border-purple-500 hover:shadow-xl transition-shadow duration-300">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Layers className="h-7 w-7 text-purple-500" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Total Usage</h3>
                            </div>
                            <BarChart className="h-7 w-7 text-purple-500" />
                        </div>
                        <p className="text-lg text-gray-700 dark:text-gray-300">{formatDataSize((peerData?.tx || 0) + (peerData?.rx || 0))}</p>
                    </div>
                </div>
            </div>
            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <Card className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg border-l-4 border-green-500 hover:shadow-xl transition-shadow duration-300">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">Total Received</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[150px]">
                            <Line data={rxChartData} options={lineChartOptions} />
                        </div>
                    </CardContent>
                </Card>
                <Card className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg border-l-4 border-red-500 hover:shadow-xl transition-shadow duration-300">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">Total Sent</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[150px]">
                            <Line data={txChartData} options={lineChartOptions} />
                        </div>
                    </CardContent>
                </Card>
                <Card className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg border-l-4 border-purple-500 hover:shadow-xl transition-shadow duration-300">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">Total RX/TX Over Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[150px]">
                            <Line data={combinedChartData} options={lineChartOptions} />
                        </div>
                    </CardContent>
                </Card>
            </div>
            {/* Sidesheet for Add DNS */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="bg-white dark:bg-gray-800 min-w-3xl">
                    <SheetHeader>
                        <SheetTitle className="text-gray-900 dark:text-gray-100">Add DNS</SheetTitle>
                    </SheetHeader>
                    <div className="p-6">
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="dns-input" className="text-gray-900 dark:text-gray-100">DNS Address</Label>
                                <Input
                                    id="dns-input"
                                    value={dnsInput}
                                    onChange={(e) => setDnsInput(e.target.value)}
                                    placeholder="e.g., 8.8.8.8"
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    </div>
                    <SheetFooter>
                        <Button
                            variant="default"
                            onClick={handleAddDns}
                        >
                        </Button>
                        <SheetClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </SheetClose>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="bg-white dark:bg-gray-800 rounded-xl">
                    <DialogHeader>
                        <DialogTitle className="text-gray-900 dark:text-gray-100">{modalContent === 'Share Content' ? 'Share' : 'Configuration'}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">{modalContent}</div>
                </DialogContent>
            </Dialog>
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
            />
        </div>
    );
};

export default PeerDetails;
