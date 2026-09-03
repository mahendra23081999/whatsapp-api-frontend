/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ROUTES } from "@/src/constants";
import { Badge } from "@/src/elements/ui/badge";
import { Button } from "@/src/elements/ui/button";
import { Progress } from "@/src/elements/ui/progress";
import { useDeleteCampaignByIdMutation, useGetCampaignsQuery, useTogglePauseCampaignMutation, useResendCampaignMutation, usePublishCampaignMutation } from "@/src/redux/api/campaignApi";
import Can from "@/src/components/shared/Can";
import CommonHeader from "@/src/shared/CommonHeader";
import ConfirmModal from "@/src/shared/ConfirmModal";
import { DataTable } from "@/src/shared/DataTable";
import ExportModal from "@/src/shared/ExportModal";
import { Campaign } from "@/src/types/components";
import { Column } from "@/src/types/shared";
import { formatDateTime } from "@/src/utils";
import { exportToCSV, exportToExcel, exportToPrint } from "@/src/utils/exportUtils";
import { AlertCircle, Calendar, CheckCircle2, Clock, FileDown, Info, Loader2, Trash2, Pause, Play, RotateCcw, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import CampaignDetailModal from "./CampaignDetailModal";
import { TabsList, TabsTrigger } from "@/src/elements/ui/tabs";
import CampaignStats from "./CampaignStats";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/src/elements/ui/dialog";
import { Input } from "@/src/elements/ui/input";
import { Label } from "@/src/elements/ui/label";
import { RadioGroup, RadioGroupItem } from "@/src/elements/ui/radio-group";

const timeFilterOptions = [
  { value: "7_days_ago", label: "7 Days" },
  { value: "14_days_ago", label: "14 Days" },
  { value: "30_days_ago", label: "30 Days" },
  { value: "all_time", label: "All Time" },
];

interface CampaignsPageProps {
  platform?: "whatsapp" | "telegram" | "facebook" | "instagram";
}

const CampaignsPage = ({ platform }: CampaignsPageProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [infoCampaignId, setInfoCampaignId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportCampaignId, setExportCampaignId] = useState<string | null>(null);

  const [togglePauseCampaign, { isLoading: isPausing }] = useTogglePauseCampaignMutation();
  const [pauseCampaignItem, setPauseCampaignItem] = useState<{ id: string; isPaused: boolean } | null>(null);

  const [resendCampaign, { isLoading: isResending }] = useResendCampaignMutation();
  const [resendCampaignId, setResendCampaignId] = useState<string | null>(null);

  const [publishCampaign, { isLoading: isPublishing }] = usePublishCampaignMutation();
  const [publishCampaignId, setPublishCampaignId] = useState<string | null>(null);

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleModalType, setScheduleModalType] = useState<"resend" | "publish">("resend");
  const [scheduleModalCampaignId, setScheduleModalCampaignId] = useState<string | null>(null);
  const [scheduleAction, setScheduleAction] = useState<"send_immediately" | "reschedule">("send_immediately");
  const [newScheduledTime, setNewScheduledTime] = useState<string>("");

  const openRescheduleModal = (type: "resend" | "publish", campaignId: string) => {
    setScheduleModalType(type);
    setScheduleModalCampaignId(campaignId);
    setScheduleAction("send_immediately");
    setNewScheduledTime("");
    setScheduleModalOpen(true);
  };

  const handleSortChange = (key: string, order: "asc" | "desc") => {
    setSortBy(key);
    setSortOrder(order);
    setPage(1);
  };

  const [timeFilter, setTimeFilter] = useState("all_time");

  const handleTimeFilterChange = (value: string) => {
    setTimeFilter(value);
    setPage(1);
  };

  const {
    data: campaignsResult,
    isLoading,
    refetch,
    isFetching,
  } = useGetCampaignsQuery({
    page,
    limit,
    search: searchTerm,
    sort_by: sortBy,
    sort_order: sortOrder,
    time_filter: timeFilter,
    ...(platform ? { platform } : {}),
  }, {
    refetchOnMountOrArgChange: true,
  });

  const [deleteCampaign, { isLoading: isDeleting }] = useDeleteCampaignByIdMutation();

  const campaigns: Campaign[] = campaignsResult?.data?.campaigns || [];
  const totalCount = campaignsResult?.data?.pagination?.totalItems || 0;

  const columns: Column<Campaign>[] = [
    {
      header: "Name",
      className: "[@media(max-width:1800px)]:min-w-[350px]",
      accessorKey: "name",
      sortable: true,
      sortKey: "name",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900 dark:text-gray-200 break-all whitespace-normal line-clamp-1">{row.name}</span>
          <span className="text-xs text-gray-400 truncate max-w-50 break-all whitespace-normal line-clamp-1">{row.description || "No description"}</span>
        </div>
      ),
    },
    {
      header: "Presets",
      className: "[@media(max-width:1800px)]:min-w-[155px]",
      sortable: true,
      sortKey: "template_name",
      accessorKey: "template_name",
      cell: (row) => (
        <Badge variant="outline" className="bg-gray-50 text-slate-600 border-blue-100 dark:bg-(--dark-sidebar) dark:text-amber-50 dark:border-(--card-border-color)">
          {row.template_name}
        </Badge>
      ),
    },
    {
      header: "Progress",
      className: "[@media(max-width:1800px)]:min-w-[200px]",
      cell: (row) => {
        const stats = row.stats;
        const progress = stats?.total_recipients ? Math.round(((stats.total_recipients - (stats.pending_count || 0)) / stats.total_recipients) * 100) : 0;
        return (
          <div className="flex flex-col gap-1 w-24">
            <Progress value={progress} className="h-1.5" />
            <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">
              {progress}% ({stats?.total_recipients - (stats?.pending_count || 0)}/{stats?.total_recipients})
            </span>
          </div>
        );
      },
    },
    {
      header: "Status",
      className: "[@media(max-width:1800px)]:min-w-[120px]",
      accessorKey: "status",
      cell: (row) => {
        const statusConfig: any = {
          draft: {
            icon: Clock,
            className: "bg-gray-100 text-gray-600 border-gray-200 dark:border-(--card-border-color) dark:bg-(--dark-sidebar) dark:hover:bg-(--table-hover)",
            label: "Draft",
          },
          scheduled: {
            icon: Calendar,
            className: "bg-amber-50 text-amber-600 border-amber-100 dark:border-(--card-border-color) dark:bg-(--dark-sidebar) dark:hover:bg-(--table-hover)",
            label: "Scheduled",
          },
          sending: {
            icon: Loader2,
            className: "bg-blue-50 text-blue-600 dark:text-primary border-blue-100 dark:border-(--card-border-color) dark:bg-(--dark-sidebar) dark:hover:bg-(--table-hover) animate-pulse",
            label: "Sending",
          },
          completed: {
            icon: CheckCircle2,
            className: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:border-(--card-border-color) dark:bg-(--dark-sidebar) dark:hover:bg-(--table-hover)",
            label: "Completed",
          },
          failed: {
            icon: AlertCircle,
            className: "bg-red-50 text-red-600 border-red-100 dark:border-(--card-border-color) dark:bg-(--dark-sidebar) dark:hover:bg-(--table-hover)",
            label: "Failed",
          },
          completed_with_errors: {
            icon: AlertCircle,
            className: "bg-red-50 text-red-600 border-red-100 dark:border-(--card-border-color) dark:bg-(--dark-sidebar) dark:hover:bg-(--table-hover)",
            label: "Failed",
          },
          cancelled: {
            icon: AlertCircle,
            className: "bg-slate-100 text-slate-600 border-slate-200 dark:border-(--card-border-color) dark:bg-(--dark-sidebar) dark:hover:bg-(--table-hover)",
            label: "Cancelled",
          },
        };
        const config = statusConfig[row.status] || statusConfig.draft;
        const Icon = config.icon;
        return (
          <Badge className={`flex items-center gap-1 border ${config.className}`}>
            <Icon size={12} className={row.status === "sending" ? "animate-spin" : ""} />
            {config.label}
          </Badge>
        );
      },
    },
    {
      header: "Publish State",
      className: "[@media(max-width:1800px)]:min-w-[120px]",
      accessorKey: "is_published",
      cell: (row) => {
        const isPublished = row.is_published ?? false;
        return (
          <Badge
            className={`flex items-center gap-1 border justify-center ${
              isPublished
                ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:border-emerald-950/20 dark:bg-emerald-950/20"
                : "bg-gray-100 text-gray-600 border-gray-200 dark:border-(--card-border-color) dark:bg-(--dark-sidebar)"
            }`}
          >
            {isPublished ? "Published" : "Draft"}
          </Badge>
        );
      },
    },
    {
      header: "Send",
      className: "[@media(max-width:1800px)]:min-w-[150px]",
      cell: (row) => (
        <div className="flex items-center gap-1 text-xs">
          <span className="text-blue-600 font-bold" title="Sent">
            {row.stats?.sent_count || 0}
          </span>
        </div>
      ),
    },
    {
      header: "Delivered",
      className: "[@media(max-width:1800px)]:min-w-[150px]",
      cell: (row) => (
        <div className="flex items-center gap-1 text-xs">
          <span className="text-emerald-600 font-bold" title="Delivered">
            {row.stats?.delivered_count || 0}
          </span>
        </div>
      ),
    },
    {
      header: "Read",
      className: "[@media(max-width:1800px)]:min-w-[150px]",
      cell: (row) => (
        <div className="flex items-center gap-1 text-xs">
          <span className="text-purple-600 font-bold" title="Read">
            {row.stats?.read_count || 0}
          </span>
        </div>
      ),
    },
    {
      header: "Failed",
      className: "[@media(max-width:1800px)]:min-w-[150px]",
      cell: (row) => (
        <div className="flex items-center gap-1 text-xs">
          <span className="text-red-500 font-bold" title="Failed">
            {row.stats?.failed_count || 0}
          </span>
        </div>
      ),
    },
    {
      header: "Sent At",
      className: "[@media(max-width:1800px)]:min-w-[200px]",
      sortable: true,
      sortKey: "sent_at",
      cell: (row) => <span className="text-gray-500 dark:text-gray-400 text-xs">{row?.sent_at ? formatDateTime(row.sent_at) : "-"}</span>,
    },
    {
      header: "Actions",
      className: "[@media(max-width:1800px)]:min-w-[190px]",
      cell: (row) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            className="w-10 h-10 border-none text-primary hover:text-primary hover:bg-primary/10 rounded-lg dark:hover:bg-primary/20 transition-all shadow-xs"
            onClick={() => {
              setInfoCampaignId(row._id || (row as any).id);
            }}
            title="Info"
          >
            <Info size={14} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-10 h-10 border-none text-primary hover:text-primary hover:bg-primary/10 rounded-lg dark:hover:bg-primary/20 transition-all shadow-xs"
            onClick={() => {
              setExportCampaignId(row._id || (row as any).id);
              setExportModalOpen(true);
            }}
            disabled={row.status !== "completed" && row.status !== "failed" && row.status !== "completed_with_errors"}
            title="Download Report"
          >
            <FileDown size={14} />
          </Button>
          <Can permission="update.campaigns">
            {row.status === "sending" && (
              <Button
                variant="outline"
                size="sm"
                className={`w-10 h-10 border-none rounded-lg transition-all shadow-xs ${
                  row.is_paused
                    ? "text-emerald-600 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                    : "text-amber-600 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20"
                }`}
                onClick={() => setPauseCampaignItem({ id: row._id || (row as any).id, isPaused: row.is_paused ?? false })}
                title={row.is_paused ? "Resume" : "Pause"}
              >
                {row.is_paused ? <Play size={14} /> : <Pause size={14} />}
              </Button>
            )}
          </Can>
          <Can permission="update.campaigns">
            {row.status === "draft" && !row.is_published && (
              <Button
                variant="outline"
                size="sm"
                className="w-10 h-10 border-none text-emerald-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg dark:text-emerald-400 dark:hover:bg-emerald-950/20 transition-all shadow-xs"
                onClick={() => setPublishCampaignId(row._id || (row as any).id)}
                title="Publish Campaign"
              >
                <Send size={14} />
              </Button>
            )}
          </Can>
          <Can permission="create.campaigns">
            {(row.status === "completed" || row.status === "completed_with_errors") && (
              <Button
                variant="outline"
                size="sm"
                className="w-10 h-10 border-none text-blue-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg dark:text-blue-400 dark:hover:bg-blue-950/20 transition-all shadow-xs"
                onClick={() => {
                  if (row.is_scheduled) {
                    openRescheduleModal("resend", row._id || (row as any).id);
                  } else {
                    setResendCampaignId(row._id || (row as any).id);
                  }
                }}
                title="Resend Campaign"
              >
                <RotateCcw size={14} />
              </Button>
            )}
          </Can>
          {(row.status === "draft" || row.status === "scheduled") && (
            <Button
              variant="outline"
              size="sm"
              className="w-10 h-10 border-none text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg dark:hover:bg-red-500/10 transition-all shadow-xs"
              onClick={() => setDeleteId(row._id || (row as any).id)}
              title="Delete"
            >
              <Trash2 size={14} />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await deleteCampaign(deleteId).unwrap();
        toast.success("Campaign deleted successfully");
        setDeleteId(null);
      } catch (error: any) {
        toast.error(error?.data?.message || "Failed to delete campaign");
      }
    }
  };

  const handlePauseConfirm = async () => {
    if (pauseCampaignItem) {
      try {
        await togglePauseCampaign(pauseCampaignItem.id).unwrap();
        toast.success(`Campaign ${!pauseCampaignItem.isPaused ? "paused" : "resumed"} successfully`);
        setPauseCampaignItem(null);
      } catch (error: any) {
        toast.error(error?.data?.error || error?.data?.message || "Failed to update campaign pause state");
      }
    }
  };

  const handleResendConfirm = async () => {
    if (resendCampaignId) {
      try {
        await resendCampaign({ id: resendCampaignId }).unwrap();
        toast.success("Campaign resent successfully");
        setResendCampaignId(null);
      } catch (error: any) {
        toast.error(error?.data?.error || error?.data?.message || "Failed to resend campaign");
      }
    }
  };

  const handlePublishConfirm = async () => {
    if (publishCampaignId) {
      try {
        await publishCampaign({ id: publishCampaignId }).unwrap();
        toast.success("Campaign published successfully");
        setPublishCampaignId(null);
      } catch (error: any) {
        if (error?.data?.code === 'SCHEDULED_TIME_PASSED') {
          setPublishCampaignId(null);
          openRescheduleModal("publish", publishCampaignId);
        } else {
          toast.error(error?.data?.error || error?.data?.message || "Failed to publish campaign");
        }
      }
    }
  };

  const handleScheduleModalSubmit = async () => {
    if (!scheduleModalCampaignId) return;
    
    if (scheduleAction === "reschedule" && !newScheduledTime) {
      toast.error("Please select a new scheduled time");
      return;
    }

    try {
      if (scheduleModalType === "resend") {
        await resendCampaign({ 
          id: scheduleModalCampaignId, 
          is_scheduled: scheduleAction === "reschedule", 
          scheduled_at: scheduleAction === "reschedule" ? newScheduledTime : undefined 
        }).unwrap();
        toast.success("Campaign resent successfully");
      } else {
        await publishCampaign({ 
          id: scheduleModalCampaignId, 
          action: scheduleAction,
          scheduled_at: scheduleAction === "reschedule" ? newScheduledTime : undefined 
        }).unwrap();
        toast.success("Campaign published successfully");
      }
      setScheduleModalOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.error || error?.data?.message || "Failed to process campaign");
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handleRefresh = () => {
    refetch();
    toast.success("Campaigns refreshed");
  };

  const handleExport = (type: "csv" | "excel" | "print") => {
    const campaignAction = campaigns.find((c) => (c._id || (c as any).id) === exportCampaignId);
    if (!campaignAction) {
      toast.error("Campaign not found");
      return;
    }

    const headers = ["Campaign Name", "Template", "Status", "Sent", "Delivered", "Read", "Failed", "Sent At"];
    const rowData = [[campaignAction.name, campaignAction.template_name, campaignAction.status, String(campaignAction.stats?.sent_count || 0), String(campaignAction.stats?.delivered_count || 0), String(campaignAction.stats?.read_count || 0), String(campaignAction.stats?.failed_count || 0), campaignAction.sent_at ? formatDateTime(campaignAction.sent_at) : "-"]];

    if (type === "csv") {
      exportToCSV(headers, rowData, "campaign_report");
    } else if (type === "excel") {
      exportToExcel(headers, rowData, "campaign_report", "Campaign Report");
    } else if (type === "print") {
      exportToPrint(headers, rowData, "Campaign Report", `Report for campaign: ${campaignAction.name}`);
    }
    setExportModalOpen(false);
  };

  const pageTitle =
    platform === "telegram" ? "Telegram Campaigns" :
      platform === "facebook" ? "Facebook Campaigns" :
        platform === "instagram" ? "Instagram Campaigns" :
          t("campaigns_page_title");

  const pageDescription =
    platform === "telegram" ? "Broadcast campaign messages directly to Telegram users." :
      platform === "facebook" ? "Reach your Facebook audience directly via Messenger campaigns." :
        platform === "instagram" ? "Engage followers directly in their Instagram DMs with campaigns." :
          t("campaigns_page_description");

  return (
    <div className="sm:p-8 pt-0! p-4 space-y-8 bg-(--page-body-bg) dark:bg-(--dark-body)">
      <CommonHeader
        title={pageTitle}
        description={pageDescription}
        middleContent={<CampaignStats stats={campaignsResult?.data?.campaignStatistics} isLoading={isLoading} />}
        onSearch={handleSearch}
        searchTerm={searchTerm}
        featureKey="contacts_used"
        searchPlaceholder="Search campaigns..."
        onRefresh={handleRefresh}
        onAddClick={() => {
          if (platform === "telegram") {
            router.push(ROUTES.TelegramCampaignsAdd);
          } else if (platform === "facebook") {
            router.push(ROUTES.FacebookCampaignsAdd);
          } else if (platform === "instagram") {
            router.push(ROUTES.InstagramCampaignsAdd);
          } else {
            router.push(ROUTES.MessageCampaignsAdd);
          }
        }}
        addLabel="Add Campaign"
        addPermission="create.campaigns"
        deletePermission="delete.campaigns"
        isLoading={isLoading}
      >
        <TabsList className="h-11 gap-2 p-1 bg-transparent">
          {timeFilterOptions.map((opt) => (
            <TabsTrigger
              key={opt.value}
              active={timeFilter === opt.value}
              onClick={() => handleTimeFilterChange(opt.value)}
              className={`h-9 px-4 text-xs font-semibold rounded-lg transition-all ${
                timeFilter === opt.value
                  ? "bg-primary! text-white! shadow-xs"
                  : "bg-slate-100! dark:bg-slate-800! text-slate-600! dark:text-slate-400! hover:bg-slate-200! dark:hover:bg-slate-700! hover:text-slate-800! dark:hover:text-slate-200!"
              }`}
            >
              {opt.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </CommonHeader>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden dark:border-(--card-border-color) dark:bg-(--card-color)">
        <DataTable data={campaigns} columns={columns} isLoading={isLoading} isFetching={isFetching} totalCount={totalCount} page={page} limit={limit} onPageChange={setPage} onLimitChange={setLimit} getRowId={(item) => item._id || (item as any).id} emptyMessage={searchTerm ? `No campaigns found matching "${searchTerm}"` : "No campaigns created yet."} className="border-none shadow-none rounded-none" onSortChange={handleSortChange} sortBy={sortBy} sortOrder={sortOrder} />
      </div>

      <CampaignDetailModal isOpen={!!infoCampaignId} onClose={() => setInfoCampaignId(null)} campaignId={infoCampaignId} />

      <ExportModal isOpen={exportModalOpen} onClose={() => setExportModalOpen(false)} onExport={handleExport} title="Download Campaign Report" description="Select your preferred format to download the campaign report." />

      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} isLoading={isDeleting} title="Delete Campaign" subtitle="Are you sure you want to delete this campaign? This action cannot be undone." confirmText="Delete" variant="danger" />

      <ConfirmModal
        isOpen={!!pauseCampaignItem}
        onClose={() => setPauseCampaignItem(null)}
        onConfirm={handlePauseConfirm}
        isLoading={isPausing}
        title={pauseCampaignItem?.isPaused ? "Resume Campaign" : "Pause Campaign"}
        subtitle={
          pauseCampaignItem?.isPaused
            ? "Are you sure you want to resume this campaign? It will start sending messages again."
            : "Are you sure you want to pause this campaign? It will temporarily stop sending messages until resumed."
        }
        confirmText={pauseCampaignItem?.isPaused ? "Resume" : "Pause"}
        variant={pauseCampaignItem?.isPaused ? "primary" : "warning"}
      />

      <ConfirmModal
        isOpen={!!resendCampaignId}
        onClose={() => setResendCampaignId(null)}
        onConfirm={handleResendConfirm}
        isLoading={isResending}
        title="Resend Campaign"
        subtitle="Are you sure you want to resend this campaign? This will duplicate the campaign configuration and send it to the recipients again."
        confirmText="Resend"
        variant="primary"
      />

      <ConfirmModal
        isOpen={!!publishCampaignId}
        onClose={() => setPublishCampaignId(null)}
        onConfirm={handlePublishConfirm}
        isLoading={isPublishing}
        title="Publish Campaign"
        subtitle="Are you sure you want to publish this campaign? This action will activate the campaign, starting delivery immediately (or at the scheduled time)."
        confirmText="Publish"
        variant="primary"
      />

      <Dialog open={scheduleModalOpen} onOpenChange={setScheduleModalOpen}>
        <DialogContent className="sm:max-w-md border-none dark:bg-landing-card-dark rounded-xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {scheduleModalType === "resend" ? "Resend Campaign" : "Scheduled Time Passed"}
            </DialogTitle>
            <div className="text-sm text-gray-500 mt-2">
              {scheduleModalType === "resend" 
                ? "This campaign was originally scheduled. How would you like to resend it?" 
                : "The original scheduled time has passed. Do you want to send it immediately or reschedule?"}
            </div>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <RadioGroup 
              value={scheduleAction} 
              onValueChange={(val: string) => setScheduleAction(val as "send_immediately" | "reschedule")}
              className="gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="send_immediately" id="r-send-now" />
                <Label htmlFor="r-send-now" className="cursor-pointer font-medium">Send Immediately</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="reschedule" id="r-reschedule" />
                <Label htmlFor="r-reschedule" className="cursor-pointer font-medium">Reschedule for Later</Label>
              </div>
            </RadioGroup>

            {scheduleAction === "reschedule" && (
              <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <Label htmlFor="newScheduledTime">Select New Time</Label>
                <Input
                  id="newScheduledTime"
                  type="datetime-local"
                  value={newScheduledTime}
                  onChange={(e) => setNewScheduledTime(e.target.value)}
                  className="w-full h-11"
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0 mt-2">
            <Button variant="outline" onClick={() => setScheduleModalOpen(false)} disabled={isResending || isPublishing}>
              Cancel
            </Button>
            <Button onClick={handleScheduleModalSubmit} disabled={isResending || isPublishing} className="bg-primary text-white">
              {(isResending || isPublishing) ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CampaignsPage;
