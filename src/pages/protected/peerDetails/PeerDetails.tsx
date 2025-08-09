"use client";

import { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { BookOpenCheck, Download, MoreVertical, QrCode, Share, Server, Upload, DownloadCloud, Layers, BarChart, Globe, Copy } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getAuthToken } from '@/api/getAuthToken';
import { base_path } from '@/api/api';
import { toast } from 'sonner';
import { formatData } from '@/utils/Formater';
import DeleteConfirmationModal from '../peer/components/DeleteConfirmationModel';
import { useUserStore } from '@/global/useUserStore';
import QRCode from "react-qr-code";
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isDnsDialogOpen, setIsDnsDialogOpen] = useState(false);
    const [dnsInput, setDnsInput] = useState('');
    const [_dnsList, setDnsList] = useState<string[]>([]);
    const [modalContent, setModalContent] = useState<React.ReactNode>(null);
    const queryClient = useQueryClient();
    const [rxHistory, setRxHistory] = useState<number[]>([]);
    const [txHistory, setTxHistory] = useState<number[]>([]);
    const [selectedUnit, setSelectedUnit] = useState<'B' | 'KB' | 'MB' | 'GB' | 'TB'>('MB');

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
            const response = await fetch(`${base_path}/api/peers/${id}/edit-dns`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify([dns]),
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || 'Failed to add DNS.');
            }
            return response.json();
        },
        onSuccess: () => {
            toast.success('DNS added successfully!');
            setDnsList((prev) => [...prev, dnsInput]);
            setIsDnsDialogOpen(false);
            setDnsInput('');
            queryClient.invalidateQueries({ queryKey: ['peer', id] });
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
                        <QRCode value={formattedData} size={256} />
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


    const labels = useMemo(() => Array.from({ length: 9 }, (_, i) => `${i + 1}s`), []);
    const maxVal = useMemo(() => {
        const values = [...rxHistory, ...txHistory].filter((v) => !isNaN(v) && v > 0);
        return values.length ? Math.max(...values) : 1000;
    }, [rxHistory, txHistory]);

    const lineChartOptions: ChartOptions<'line'> = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 1000,
            easing: "easeOutCubic" as const,
        },
        plugins: {
            legend: {
                display: false,
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
                        return `${label}: ${formatData(val, selectedUnit)}`;
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
                        return typeof tickValue === "number" ? formatData(tickValue, selectedUnit) : tickValue;
                    },
                },
                suggestedMax: maxVal * 1.2,
                beginAtZero: true,
            },
        },
    }), [maxVal, theme, selectedUnit]);

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
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <header className="flex flex-col sm:flex-row items-center justify-between mb-6 sm:mb-8 gap-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 truncate">
                        {peerData?.peer_name}
                    </h1>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-center sm:justify-end">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-xs sm:text-sm w-full sm:w-auto"
                        onClick={() => setIsSheetOpen(true)}
                    >
                        <Globe className="h-4 w-4 text-blue-500" />
                        Add DNS
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-xs sm:text-sm w-full sm:w-auto"
                        onClick={handleQRModal}
                    >
                        <QrCode className="h-4 w-4 text-blue-500" />
                        QR Code
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-xs sm:text-sm w-full sm:w-auto"
                        onClick={() => {
                            setModalContent('Share Content');
                            setIsModalOpen(true);
                        }}
                    >
                        <Share className="h-4 w-4 text-blue-500" />
                        Share
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-xs sm:text-sm w-full sm:w-auto"
                        onClick={handleDownload}
                    >
                        <Download className="h-4 w-4 text-blue-500" />
                        Download
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-xs sm:text-sm w-full sm:w-auto"
                        onClick={handleConfigModal}
                    >
                        <MoreVertical className="h-4 w-4 text-blue-500" />
                        Config
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 transition-colors text-xs sm:text-sm w-full sm:w-auto"
                        onClick={() => setIsDeleteModalOpen(true)}
                    >
                        Delete
                    </Button>
                </div>
            </header>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg border-l-4 border-blue-500 hover:shadow-xl transition-shadow duration-300">
                    <div className="p-4 sm:p-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Server className="h-5 w-5 text-blue-500" />
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">IP Address</h3>
                        </div>
                        <div className="flex justify-between items-center">
                            <span ref={ipAddressRef} className="text-base sm:text-lg font-mono text-gray-700 dark:text-gray-300 truncate">
                                {peerData?.assigned_ip}
                            </span>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Copy className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" onClick={handleCopy} />
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    {copied ? "Copied!" : "Copy"}
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </div>
                </div>
                        {/* Total Sent with dropdown */}
                <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg border-l-4 border-yellow-500 hover:shadow-xl transition-shadow duration-300">
                    <div className="p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Upload className="h-5 w-5 text-yellow-500" />
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Total Sent</h3>
                            </div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                                <span>
                                    {formatData(peerData?.tx || 0, selectedUnit).split(" ")[0]}
                                </span>
                                <select
                                    className=""
                                    value={selectedUnit}
                                    onChange={e => setSelectedUnit(e.target.value as "B" | "KB" | "MB" | "GB" | "TB")}
                                >
                                    <option value="B" className='dark:text-black'>B</option>
                                    <option value="KB" className='dark:text-black'>KB</option>
                                    <option value="MB" className='dark:text-black'>MB</option>
                                    <option value="GB" className='dark:text-black'>GB</option>
                                    <option value="TB" className='dark:text-black'>TB</option>
                                </select>
                            </div>
                            <Upload className="h-6 w-6 sm:h-7 sm:w-7 text-yellow-500" />
                        </div>
                    </div>
                </div>
                {/* Total Received with dropdown */}
                <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg border-l-4 border-green-500 hover:shadow-xl transition-shadow duration-300">
                    <div className="p-4 sm:p-6">
                        <div className="flex items-center mb-2 gap-2">
                            <DownloadCloud className="h-5 w-5 text-green-500" />
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Total Received</h3>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                                <span>
                                    {formatData(peerData?.rx || 0, selectedUnit).split(" ")[0]}
                                </span>
                                <select
                                    className=""
                                    value={selectedUnit}
                                    onChange={e => setSelectedUnit(e.target.value as "B" | "KB" | "MB" | "GB" | "TB")}
                                >
                                    <option value="B" className='dark:text-black'>B</option>
                                    <option value="KB" className='dark:text-black'>KB</option>
                                    <option value="MB" className='dark:text-black'>MB</option>
                                    <option value="GB" className='dark:text-black'>GB</option>
                                    <option value="TB" className='dark:text-black'>TB</option>
                                </select>
                            </div>
                            <Download className="h-6 w-6 sm:h-7 sm:w-7 text-green-500" />
                        </div>
                    </div>
                </div>
        
                {/* Total Usage with dropdown */}
                <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg border-l-4 border-purple-500 hover:shadow-xl transition-shadow duration-300">
                    <div className="p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Layers className="h-6 w-6 sm:h-7 sm:w-7 text-purple-500" />
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Total Usage</h3>
                            </div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                                <span>
                                    {formatData((peerData?.tx || 0) + (peerData?.rx || 0), selectedUnit).split(" ")[0]}
                                </span>
                                <select
                                    className=""
                                    value={selectedUnit}
                                    onChange={e => setSelectedUnit(e.target.value as "B" | "KB" | "MB" | "GB" | "TB")}
                                >
                                    <option value="B" className='dark:text-black'>B</option>
                                    <option value="KB" className='dark:text-black'>KB</option>
                                    <option value="MB" className='dark:text-black'>MB</option>
                                    <option value="GB" className='dark:text-black'>GB</option>
                                    <option value="TB" className='dark:text-black'>TB</option>
                                </select>
                            </div>
                            <BarChart className="h-6 w-6 sm:h-7 sm:w-7 text-purple-500" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-4 sm:mt-6">
                <Card className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg border-l-4 border-green-500 hover:shadow-xl transition-shadow duration-300">
                    <CardHeader>
                        <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Total Received</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[120px] sm:h-[150px]">
                            <Line data={rxChartData} options={lineChartOptions} />
                        </div>
                    </CardContent>
                </Card>
                <Card className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg border-l-4 border-red-500 hover:shadow-xl transition-shadow duration-300">
                    <CardHeader>
                        <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Total Sent</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[120px] sm:h-[150px]">
                            <Line data={txChartData} options={lineChartOptions} />
                        </div>
                    </CardContent>
                </Card>
                <Card className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg border-l-4 border-purple-500 hover:shadow-xl transition-shadow duration-300">
                    <CardHeader>
                        <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Total RX/TX Over Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[120px] sm:h-[150px]">
                            <Line data={combinedChartData} options={lineChartOptions} />
                        </div>
                    </CardContent>
                </Card>
            </div>
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="bg-white dark:bg-gray-800 w-full sm:min-w-[400px] lg:min-w-[500px]">
                    <SheetHeader>
                        <SheetTitle className="text-gray-900 dark:text-gray-100 text-base sm:text-lg">DNS Configurations</SheetTitle>
                    </SheetHeader>
                    <div className="p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">DNS List</span>
                            <Button
                                variant="default"
                                onClick={() => setIsDnsDialogOpen(true)}
                                className="text-xs sm:text-sm"
                            >
                                + Add DNS
                            </Button>
                        </div>
                        {peerData?.dns && peerData.dns.length > 0 ? (
                            <ul className="space-y-2">
                                {peerData.dns.map((dns: string, index: number) => (
                                    <li
                                        key={index}
                                        className="flex items-center justify-between bg-gray-100 dark:bg-gray-900 rounded px-3 py-2 text-sm sm:text-base"
                                    >
                                        <span className="font-mono">{dns}</span>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="ml-2"
                                                    onClick={async () => {
                                                        try {
                                                            await navigator.clipboard.writeText(dns);
                                                            toast.success('DNS copied to clipboard');
                                                        } catch {
                                                            toast.error('Failed to copy DNS');
                                                        }
                                                    }}
                                                >
                                                    <Copy className="w-4 h-4 text-blue-600" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent side="top">
                                                Copy DNS
                                            </TooltipContent>
                                        </Tooltip>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                                No DNS addresses configured.
                            </div>
                        )}
                    </div>
                    <SheetFooter>
                        <SheetClose asChild>
                            <Button variant="outline" className="text-xs sm:text-sm w-full sm:w-auto">Close</Button>
                        </SheetClose>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
            <Dialog open={isDnsDialogOpen} onOpenChange={setIsDnsDialogOpen}>
                <DialogContent className="bg-white dark:bg-gray-800 rounded-xl w-[90vw] sm:w-full max-w-[400px] sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="text-gray-900 dark:text-gray-100 text-base sm:text-lg">Add DNS Address</DialogTitle>
                    </DialogHeader>
                    <div className="p-4 space-y-4">
                        <div>
                            <Label htmlFor="dns-input" className="text-gray-900 dark:text-gray-100 text-sm sm:text-base">DNS Address</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    id="dns-input"
                                    value={dnsInput}
                                    onChange={(e) => setDnsInput(e.target.value)}
                                    placeholder="e.g., test1"
                                    className="mt-1 text-sm sm:text-base"
                                />
                                <span className="text-gray-500 dark:text-gray-400 text-sm">.ys</span>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="default"
                                onClick={() => {
                                    if (!dnsInput.trim()) {
                                        toast.error('Please enter a valid DNS address');
                                        return;
                                    }
                                    const dnsToAdd = dnsInput.endsWith('.ys') ? dnsInput : `${dnsInput}.ys`;
                                    addDnsMutation.mutate(dnsToAdd);
                                }}
                                className="text-xs sm:text-sm w-full sm:w-auto"
                            >
                                Add DNS
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsDnsDialogOpen(false);
                                    setDnsInput('');
                                }}
                                className="text-xs sm:text-sm w-full sm:w-auto"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="bg-white dark:bg-gray-800 rounded-xl w-[90vw] sm:w-full max-w-[400px] sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="text-gray-900 dark:text-gray-100 text-base sm:text-lg">
                            {modalContent === 'Share Content' ? 'Share' : 'Configuration'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4 text-sm sm:text-base">{modalContent}</div>
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