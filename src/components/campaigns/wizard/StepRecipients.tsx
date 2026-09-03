/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useGetContactQuery } from "@/src/redux/api/contactApi";
import { useGetTagsQuery } from "@/src/redux/api/tagsApi";
import { useGetSegmentsQuery } from "@/src/redux/api/segmentApi";
import { CampaignFormValues, Contact, Tag } from "@/src/types/components";
import { FormikProps } from "formik";
import { Hash, UserCheck, Users, Layers } from "lucide-react";
import { ReactNode } from "react";
import { AllContactsAlert } from "./components/AllContactsAlert";
import { RecipientSelectionField } from "./components/RecipientSelectionField";
import { RecipientTypeCard } from "./components/RecipientTypeCard";
import { maskSensitiveData } from "@/src/utils/masking";
import { useAppSelector } from "@/src/redux/hooks";
import { Switch } from "@/src/elements/ui/switch";
import { Label } from "@/src/elements/ui/label";
import { useFeatureAccess } from "@/src/hooks/useFeatureAccess";
import { useMemo } from "react";

const StepRecipients = ({ formik }: { formik: FormikProps<CampaignFormValues> }) => {
  const { data: contactsResult } = useGetContactQuery({
    platform: formik.values.platform || "whatsapp"
  });
  const { is_demo_mode } = useAppSelector((state) => state.setting);
  const contacts = (contactsResult as any)?.data?.contacts || [];

  const { data: tagsResult } = useGetTagsQuery({});
  const tags = (tagsResult as any)?.data?.tags || [];

  const { data: segmentsResult } = useGetSegmentsQuery({});
  const segments = (segmentsResult as any)?.data?.segments || [];

  const { isFeatureEnabled } = useFeatureAccess();

  const recipientTypes = useMemo(() => {
    const types: {
      id: CampaignFormValues["recipient_type"];
      title: string;
      icon: ReactNode;
      description: string;
    }[] = [
        { id: "all_contacts", title: "All Contacts", icon: <Users size={24} />, description: "Send to everyone in your database" },
        {
          id: "specific_contacts",
          title: "Specific Contacts",
          icon: <UserCheck size={24} />,
          description: "Handpick individual recipients",
        },
        { id: "tags", title: "Segment by Tags", icon: <Hash size={24} />, description: "target people with specific labels" },
        { id: "segments", title: "Target Segments", icon: <Layers size={24} />, description: "Send to pre-defined customer segments" },
      ];

    return types.filter((type) => {
      if (type.id === "tags") return isFeatureEnabled("tags");
      if (type.id === "segments") return isFeatureEnabled("segments");
      return true;
    });
  }, [isFeatureEnabled]);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center gap-4">
        <div className="p-2.5 sm:p-3.5 bg-primary/10 rounded-lg">
          <Users className="text-primary w-6 h-6" />
        </div>
        <div>
          <h2 className="sm:text-xl text-lg font-bold text-primary ">Recipients Selection</h2>
          <p className="text-slate-500 font-medium text-sm">Choose who will receive this campaign message.</p>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible custom-scrollbar">
        {recipientTypes.map((type) => (
          <div key={type.id} className="min-w-40 shrink-0 sm:min-w-0">
            <RecipientTypeCard
              {...type}
              isSelected={formik.values.recipient_type === type.id}
              onClick={() => {
                formik.setFieldValue("recipient_type", type.id);
              }}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-(--card-color) rounded-lg border border-slate-200/60 dark:border-(--card-border-color) shadow">
        <div className="space-y-0.5">
          <Label htmlFor="avoid_unsubscribers" className="text-sm font-bold text-slate-700 dark:text-gray-300 cursor-pointer">
            Avoid Unsubscribers
          </Label>
          <p className="text-[11px] text-slate-500 font-medium">When enabled, messages will not be sent to contacts who have unsubscribed.</p>
        </div>
        <Switch id="avoid_unsubscribers" checked={formik.values.avoid_unsubscribers} onCheckedChange={(checked) => formik.setFieldValue("avoid_unsubscribers", checked)} className="data-[state=checked]:bg-emerald-500" />
      </div>

      <div className="min-h-25 animate-in fade-in slide-in-from-top-4">
        {formik.values.recipient_type === "specific_contacts" && (
          <RecipientSelectionField
            label="Search & Select Contacts"
            placeholder="Start typing contact name..."
            options={contacts
              .filter((c: Contact) => (formik.values.avoid_unsubscribers ? !c.is_unsubscribed : true))
              .map((c: Contact) => ({
                label: `${c.name} ${c.phone_number ? `(${maskSensitiveData(c.phone_number, "phone", is_demo_mode)})` : ""}`,
                value: c._id,
              }))}
            selectedValues={formik.values.specific_contacts}
            onChange={(vals) => formik.setFieldValue("specific_contacts", vals)}
          />
        )}

        {formik.values.recipient_type === "tags" && <RecipientSelectionField label="Select Customer Tags" placeholder="Select one or more tags..." options={tags.map((t: Tag) => ({ label: t.label, value: t._id, color: t.color }))} selectedValues={formik.values.tag_ids} onChange={(vals) => formik.setFieldValue("tag_ids", vals)} />}

        {formik.values.recipient_type === "segments" && <RecipientSelectionField label="Select Customer Segments" placeholder="Select one or more segments..." options={segments.map((s: any) => ({ label: s.name, value: s._id }))} selectedValues={formik.values.segment_ids} onChange={(vals) => formik.setFieldValue("segment_ids", vals)} />}

        {formik.values.recipient_type === "all_contacts" && <AllContactsAlert count={contacts.filter((c: Contact) => (formik.values.avoid_unsubscribers ? !c.is_unsubscribed : true)).length} totalCount={contacts.length} avoidUnsubscribers={formik.values.avoid_unsubscribers} />}
      </div>
    </div>
  );
};

export default StepRecipients;
