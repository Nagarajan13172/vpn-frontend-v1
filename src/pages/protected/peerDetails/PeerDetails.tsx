import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BookA, Download, MoreVertical, QrCode, Share } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getAuthToken } from '@/api/getAuthToken';
import { base_path } from '@/api/api';
import { toast } from 'sonner';
import { formatDataSize, formatTimeAgo, peerStatus } from '@/utils/Formater';

import { PiHandshakeDuotone } from 'react-icons/pi';
import DeleteConfirmationModal from '../peer/components/DeleteConfirmationModel';
import { useUserStore } from '@/global/useUserStore';
import { QRCodeCanvas } from 'qrcode.react';
import { useBreadcrumb } from '@/components/breadcrumb/BreadcrumbContext';



const PeerDetails = () => {

    {
        /* BreadCrumbs */
    }
    const { setBreadcrumbs } = useBreadcrumb();
    useEffect(() => {
        setBreadcrumbs([
            {
                label: (
                    <div className="flex items-center gap-1">
                        <BookA className="h-4 w-4" />
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

    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useUserStore()
    const [copied, setCopied] = useState(false);
    const ipAddressRef = useRef<HTMLSpanElement>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const queryClient = useQueryClient();
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
        refetchInterval: 10000,
    });

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
            return response.text(); // Return raw text for config
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (peerId: string | undefined) => {
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
            const errorMessage =
                err && typeof err === 'object' && 'message' in err
                    ? (err as { message?: string }).message
                    : 'Failed to copy IP address';
            toast.error(errorMessage || 'Failed to copy IP address');
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
                        <pre className="text-sm p-4 rounded overflow-auto whitespace-pre-wrap break-words" id="peer-config-content">
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

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState<React.ReactNode>(null);

    if (isLoading) {
        return <div className="text-center mt-10">Loading...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto p-4">
            <header className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">{peerData?.peer_name}</h1>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleQRModal}>
                        <QrCode className="mr-2 h-4 w-4" /> QR Code
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => { setModalContent('Share Content'); setIsModalOpen(true); }}>
                        <Share className="mr-2 h-4 w-4" /> Share
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDownload}>
                        <Download className="mr-2 h-4 w-4" /> Download
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleConfigModal}>
                        <MoreVertical className="mr-2 h-4 w-4" /> Config
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => setIsDeleteModalOpen(true)}>
                        Delete
                    </Button>
                </div>
            </header>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>IP Address</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-center">
                            <span ref={ipAddressRef} className="text-lg font-mono">{peerData?.assigned_ip}</span>
                            <Button variant="ghost" size="sm" onClick={handleCopy}>
                                {copied ? 'Copied!' : 'Copy'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Total Received</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg">{formatDataSize(peerData?.rx)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Total Sent</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg">{formatDataSize(peerData?.tx)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Total Usage</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg">{formatDataSize((peerData?.tx || 0) + (peerData?.rx || 0))}</p>
                    </CardContent>
                </Card>
            </div>
            <div className="mt-6">
                <Badge variant={peerStatus(peerData?.latest_handshake) ? 'default' : 'destructive'} className="flex items-center gap-1.5">
                    <PiHandshakeDuotone className="h-4 w-4" />
                    {peerStatus(peerData?.latest_handshake) ? 'Online' : 'Offline'}
                </Badge>
                <p className="text-sm mt-2">{formatTimeAgo(peerData?.latest_handshake)}</p>
            </div>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{modalContent === 'Share Content' ? 'Share' : 'Configuration'}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">{modalContent}</div>
                    {/* <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Close</Button>
                    </DialogFooter> */}
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