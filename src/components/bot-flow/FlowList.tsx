/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Can from "@/src/components/shared/Can";
import { ROUTES } from "@/src/constants/route";
import { Button } from "@/src/elements/ui/button";
import { Switch } from "@/src/elements/ui/switch";
import { useDeleteAutomationFlowMutation, useGetAutomationFlowsQuery, useToggleAutomationFlowMutation, useTogglePauseAutomationFlowMutation } from "@/src/redux/api/automationApi";
import CommonHeader from "@/src/shared/CommonHeader";
import ConfirmModal from "@/src/shared/ConfirmModal";
import { DataTable } from "@/src/shared/DataTable";
import { Column } from "@/src/types/shared";
import useDebounce from "@/src/utils/hooks/useDebounce";
import { Edit2, Trash2, Pause, Play } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAppSelector } from "@/src/redux/hooks";


export default function FlowList() {
  const { t } = useTranslation();
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  const searchTerm = useDebounce(inputValue, 500);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { selectedWorkspace } = useAppSelector((state) => state.workspace);
  const workspaceId = selectedWorkspace?._id || "";

  const {
    data: flowsResult,
    isLoading,
    refetch,
    isFetching,
  } = useGetAutomationFlowsQuery({
    page,
    limit,
    search: searchTerm,
    sort_by: sortBy,
    sort_order: sortOrder,
    workspace_id: workspaceId,
    status: statusFilter,
  });

  const [deleteFlow, { isLoading: isDeleting }] = useDeleteAutomationFlowMutation();
  const [toggleFlow] = useToggleAutomationFlowMutation();
  const [togglePauseFlow, { isLoading: isPausing }] = useTogglePauseAutomationFlowMutation();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [pauseFlowItem, setPauseFlowItem] = useState<{ id: string; isPaused: boolean } | null>(null);
  const [localStatuses, setLocalStatuses] = useState<Record<string, boolean>>({});

  const flows = flowsResult?.data || [];
  const totalCount = flowsResult?.pagination?.totalItems || 0;

  const [visibleColumns, setVisibleColumns] = useState([
    { id: "Name", label: "Name", isVisible: true },
    { id: "Platform", label: "Platform", isVisible: true },
    { id: "Nodes", label: "Nodes", isVisible: true },
    { id: "Publish Status", label: "Publish Status", isVisible: true },
    { id: "Status", label: "Status", isVisible: true },
    { id: "Created At", label: "Created At", isVisible: true },
    { id: "Actions", label: "Actions", isVisible: true },
  ]);

  const handleColumnToggle = (columnId: string) => {
    setVisibleColumns((prev) => prev.map((col) => (col.id === columnId ? { ...col, isVisible: !col.isVisible } : col)));
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await deleteFlow({ ids: [deleteId], workspace_id: workspaceId }).unwrap();
        toast.success("Flow deleted successfully");
        setDeleteId(null);
      } catch {
        toast.error("Failed to delete flow");
      }
    }
  };

  const handlePauseConfirm = async () => {
    if (pauseFlowItem) {
      try {
        await togglePauseFlow({
          flowId: pauseFlowItem.id,
          is_paused: !pauseFlowItem.isPaused,
          workspace_id: workspaceId,
        }).unwrap();
        toast.success(`Flow ${!pauseFlowItem.isPaused ? "paused" : "resumed"} successfully`);
        setPauseFlowItem(null);
      } catch {
        toast.error("Failed to update flow pause state");
      }
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setBulkConfirmOpen(true);
  };

  const confirmBulkDelete = async () => {
    try {
      await deleteFlow({ ids: selectedIds, workspace_id: workspaceId }).unwrap();
      toast.success(`${selectedIds.length} flows deleted successfully`);
      setSelectedIds([]);
    } catch (error: any) {
      toast.error(error?.data?.message || error?.data?.message || "Failed to delete flows");
    } finally {
      setBulkConfirmOpen(false);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    setLocalStatuses((prev) => ({ ...prev, [id]: !currentStatus }));
    try {
      await toggleFlow({ flowId: id, is_active: !currentStatus, workspace_id: workspaceId }).unwrap();
      toast.success(`Flow ${!currentStatus ? "activated" : "deactivated"}`);
    } catch {
      setLocalStatuses((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      toast.error("Failed to toggle status");
    }
  };

  const handleSearch = (value: string) => {
    setInputValue(value);
    setPage(1);
  };

  const handleRefresh = () => {
    refetch();
    toast.success("Successfully refresh table.");
  };

  const handleSort = (key: string, order: "asc" | "desc") => {
    setSortBy(key);
    setSortOrder(order);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const onAddClick = () => {
    router.push(ROUTES.BuilderBotFlow);
  };

  const columns: Column<any>[] = [
    {
      header: "Name",
      sortable: true,
      sortKey: "name",
      cell: (flow) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">{flow.name}</div>
          <div className="text-xs text-gray-500">{flow.description || "No description"}</div>
        </div>
      ),
    },
    {
      header: "Platform",
      sortable: true,
      sortKey: "platform",
      cell: (flow) => {
        const platform = flow.platform || "all";
        const badgeStyles: Record<string, string> = {
          all: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30",
          whatsapp: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30",
          telegram: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-900/30",
          facebook: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30",
          instagram: "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/20 dark:text-pink-400 dark:border-pink-900/30",
        };

        const displayNames: Record<string, string> = {
          all: "All Channels",
          whatsapp: "WhatsApp",
          telegram: "Telegram",
          facebook: "Facebook",
          instagram: "Instagram",
        };

        const style = badgeStyles[platform] || badgeStyles.all;
        const name = displayNames[platform] || displayNames.all;

        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style}`}>
            {name}
          </span>
        );
      },
    },
    {
      header: "Nodes",
      sortable: true,
      sortKey: "nodes",
      cell: (flow) => <div className="text-sm text-gray-600">{flow.nodes?.length || 0} nodes</div>,
    },
    {
      header: "Publish Status",
      sortable: true,
      sortKey: "is_active",
      cell: (flow) => {
        const isActive = localStatuses[flow._id] ?? flow.is_active;
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
            isActive 
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-indigo-900/30" 
              : "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-900/10 dark:text-gray-400 dark:border-gray-800/30"
          }`}>
            {isActive ? "Publish" : "Draft"}
          </span>
        );
      },
    },
    {
      header: "Created At",
      sortable: true,
      sortKey: "created_at",
      cell: (flow) => <span className="text-sm text-gray-500">{new Date(flow.created_at).toLocaleDateString()}</span>, 
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (flow) => {
        const isActive = localStatuses[flow._id] ?? flow.is_active;
        const isPaused = flow.is_paused ?? false;
        return (
          <div className="flex justify-end gap-2">
            <Can permission="update.automation_flows">
              <Link href={`${ROUTES.BuilderBotFlow}/${flow._id}`}>
                <Button variant="outline" size="sm" className="w-10 h-10 border-none text-primary hover:text-primary hover:bg-primary/10 rounded-lg dark:hover:bg-primary/20 transition-all">
                  <Edit2 size={14} />
                </Button>
              </Link>
            </Can>
            <Can permission="update.automation_flows">
              <Button
                variant="outline"
                size="sm"
                disabled={!isActive}
                className={`w-10 h-10 border-none rounded-lg transition-all ${
                  !isActive
                    ? "text-gray-400 cursor-not-allowed bg-transparent"
                    : isPaused
                    ? "text-emerald-600 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                    : "text-amber-600 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20"
                }`}
                onClick={() => setPauseFlowItem({ id: flow._id, isPaused })}
              >
                {isPaused ? <Play size={14} /> : <Pause size={14} />}
              </Button>
            </Can>
            <Can permission="delete.automation_flows">
              <Button variant="outline" size="sm" className="w-10 h-10 border-none text-red-600 hover:text-red-600 dark:text-red-500 hover:bg-red-50 rounded-lg transition-all dark:hover:bg-red-900/20" onClick={() => setDeleteId(flow._id)}>
                <Trash2 size={14} />
              </Button>
            </Can>
          </div>
        );
      },
    },
  ];

  return (
    <div className="sm:p-8 pt-0! p-4 space-y-8 bg-(--page-body-bg) dark:bg-(--dark-body)">
      <CommonHeader title={t("flow_builder_page_title")} description={t("flow_builder_page_description")} onSearch={handleSearch} searchTerm={inputValue} searchPlaceholder="Search flows..." featureKey="template_bots_used" onRefresh={handleRefresh} onAddClick={onAddClick} addLabel="Add New Flow" addPermission="create.automation_flows" deletePermission="delete.automation_flows" isLoading={isLoading} columns={visibleColumns} onColumnToggle={handleColumnToggle} onBulkDelete={handleBulkDelete} selectedCount={selectedIds.length} />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap mb-4">
        {[
          { key: "all", label: "Show All" },
          { key: "active", label: "Publish" },
          { key: "draft", label: "Draft" },
          { key: "paused", label: "Pause" },
        ].map((tab) => (
          <Button
            key={tab.key}
            onClick={() => {
              setStatusFilter(tab.key);
              setPage(1);
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              statusFilter === tab.key
                ? "bg-primary text-white shadow-sm hover:bg-primary"
                : "bg-white hover:bg-white dark:hover:bg-(--card-color) dark:bg-(--card-color) text-slate-600 dark:text-gray-400 border border-slate-200 dark:border-(--card-border-color) hover:border-primary/50 hover:text-primary"
            }`}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden dark:bg-(--card-color) dark:border-(--card-border-color)">
        <DataTable data={flows} columns={columns.filter((col) => visibleColumns.find((vc) => vc.id === col.header)?.isVisible !== false)} isLoading={isLoading} isFetching={isFetching || isDeleting} totalCount={totalCount} page={page} limit={limit} onPageChange={handlePageChange} onLimitChange={handleLimitChange} enableSelection={false} selectedIds={selectedIds} onSelectionChange={setSelectedIds} getRowId={(item) => item._id} emptyMessage={searchTerm ? `No flows found matching "${searchTerm}"` : "No automation flows found. Create your first one!"} className="border-none shadow-none rounded-none" onSortChange={handleSort} sortBy={sortBy} sortOrder={sortOrder} />
      </div>

      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} isLoading={isDeleting} title="Delete Automation Flow" subtitle="Are you sure you want to delete this automation flow? This action cannot be undone and all associated data will be permanently removed." confirmText="Delete Flow" variant="danger" />
      <ConfirmModal isOpen={bulkConfirmOpen} onClose={() => setBulkConfirmOpen(false)} onConfirm={confirmBulkDelete} isLoading={isDeleting} title="Bulk Delete Flows" subtitle={`Are you sure you want to delete ${selectedIds.length} selected flows? This action cannot be undone.`} confirmText="Delete All" variant="danger" />
      <ConfirmModal
        isOpen={!!pauseFlowItem}
        onClose={() => setPauseFlowItem(null)}
        onConfirm={handlePauseConfirm}
        isLoading={isPausing}
        title={pauseFlowItem?.isPaused ? "Resume Automation Flow" : "Pause Automation Flow"}
        subtitle={
          pauseFlowItem?.isPaused
            ? "Are you sure you want to resume this automation flow? It will start executing triggers again."
            : "Are you sure you want to pause this automation flow? It will temporarily stop executing triggers until resumed."
        }
        confirmText={pauseFlowItem?.isPaused ? "Resume Flow" : "Pause Flow"}
        variant={pauseFlowItem?.isPaused ? "primary" : "warning"}
      />
    </div>
  );
}
