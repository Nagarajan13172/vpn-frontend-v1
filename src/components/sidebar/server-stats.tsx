import { Progress } from '@/components/ui/progress';
import { Cpu, MemoryStick, Network, Terminal } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    type ChartOptions,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface Stats {
    BlockIO: string;
    CPUPerc: string;
    MemPerc: string;
    MemUsage: string;
    NetIO: string;
    PIDs: string;
}

export interface StatsHistoryPoint {
    name: string;
    rawBlockRead: number;
    rawBlockWrite: number;
    rawNetRead: number;
    rawNetWrite: number;
}

export function ServerStats({ stats, history }: { stats: Stats; history: StatsHistoryPoint[] }) {
    const cpuPercentage = parseFloat(stats.CPUPerc.replace('%', ''));
    const memPercentage = parseFloat(stats.MemPerc.replace('%', ''));

    const labels = history.map((point) => point.name);

    const computeDelta = (arr: StatsHistoryPoint[], key: keyof StatsHistoryPoint): number[] => {
        return arr.map((ar) => Number(ar[key]));
    };

    // const blockIOChartData = {
    //     labels,
    //     datasets: [
    //         {
    //             label: 'Read (MB)',
    //             data: computeDelta(history, 'rawBlockRead'),
    //             borderColor: 'rgb(54, 162, 235)',
    //             backgroundColor: 'rgba(54, 162, 235, 0.2)',
    //             borderWidth: 2,
    //             fill: false,
    //             tension: 0.4,
    //             pointRadius: 0,
    //         },
    //         {
    //             label: 'Write (MB)',
    //             data: computeDelta(history, 'rawBlockWrite'),
    //             borderColor: 'rgb(255, 99, 132)',
    //             backgroundColor: 'rgba(255, 99, 132, 0.2)',
    //             borderWidth: 2,
    //             fill: false,
    //             tension: 0.4,
    //             pointRadius: 0,
    //         },
    //     ],
    // };

    const netIOChartData = {
        labels,
        datasets: [
            {
                label: 'Read (MB)',
                data: computeDelta(history, 'rawNetRead'),
                borderColor: 'rgb(54, 162, 235)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderWidth: 2,
                fill: false,
                tension: 0.4,
                pointRadius: 0,
            },
            {
                label: 'Write (MB)',
                data: computeDelta(history, 'rawNetWrite'),
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderWidth: 2,
                fill: false,
                tension: 0.4,
                pointRadius: 0,
            },
        ],
    };

    const chartOptions: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 5000,
            easing: 'easeInOutSine',
        },
        plugins: {
            legend: {
                display: false,
                position: 'bottom',
            },
        },
        scales: {
            x: { display: false },
            y: { display: false },
        },
    };

    return (
        <div className="space-y-4 text-sm p-2 group-data-[collapsible=icon]:hidden">
            <div>
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                        <Cpu className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">CPU</span>
                    </div>
                    <span className="font-mono text-muted-foreground">{stats.CPUPerc}</span>
                </div>
                <Progress
                    value={cpuPercentage}
                    className="h-2 transition-all duration-5000"
                />
            </div>
            <div>
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                        <MemoryStick className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Memory</span>
                    </div>
                    <span className="font-mono text-muted-foreground">{stats.MemPerc}</span>
                </div>
                <Progress value={memPercentage} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1 text-right">{stats.MemUsage}</p>
            </div>
            <div className="space-y-3">
                {/* <div>
                    <div className="flex items-center justify-between mb-1 text-xs">
                        <div className="flex items-center gap-2 font-medium">
                            <HardDrive className="h-4 w-4 text-muted-foreground" />
                            <span>Block I/O</span>
                        </div>
                        <span className="font-mono text-muted-foreground">{stats.BlockIO}</span>
                    </div>
                    <div className="h-[150px] w-full">
                        <Line data={blockIOChartData} options={chartOptions} />
                    </div>
                </div> */}
                <div>
                    <div className="flex items-center justify-between mb-1 text-xs">
                        <div className="flex items-center gap-2 font-medium">
                            <Network className="h-4 w-4 text-muted-foreground" />
                            <span>Net I/O</span>
                        </div>
                        <span className="font-mono text-muted-foreground">{stats.NetIO}</span>
                    </div>
                    <div className="h-[60px] w-full">
                        <Line data={netIOChartData} options={chartOptions} />
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Terminal className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">PIDs</span>
                    </div>
                    <span className="font-mono text-muted-foreground">{stats.PIDs}</span>
                </div>
            </div>
        </div>
    );
}
