import { ReactNode } from "react";
import { Bot, Key, Link, ShieldCheck, Sparkles, MessageSquareCode, Settings2, ShieldAlert, Award, FileText, CheckCircle } from "lucide-react";

export interface ConnectionStep {
  title: string;
  description: string;
  icon: ReactNode;
}

export interface ChannelInfo {
  title: string;
  subtitle: string;
  brandColor: string; // Tailwind class color
  gradientClass: string; // Background gradient class
  icon: ReactNode;
  requirements: string[];
  steps: ConnectionStep[];
  features: {
    title: string;
    description: string;
    icon: ReactNode;
  }[];
  proTip: string;
}

export const CHANNEL_CONNECTION_DATA: Record<"telegram" | "facebook" | "instagram", ChannelInfo> = {
  telegram: {
    title: "Telegram Bot Setup Guide",
    subtitle: "Complete these steps to link your Telegram channel and enable automated workflows.",
    brandColor: "#229ED9",
    gradientClass: "from-[#229ED9]/10 via-[#229ED9]/5 to-transparent",
    icon: <Bot className="w-6 h-6 text-[#229ED9]" />,
    requirements: [
      "An active Telegram Account",
      "Access to Telegram Web/App",
      "A unique name for your Telegram Bot",
    ],
    steps: [
      {
        title: "Locate BotFather",
        description: "Open Telegram and search for the official @BotFather account (look for the verified badge).",
        icon: <Bot className="w-5 h-5" />,
      },
      {
        title: "Create New Bot",
        description: "Send the /newbot command to @BotFather and follow instructions to name your bot and choose a username.",
        icon: <MessageSquareCode className="w-5 h-5" />,
      },
      {
        title: "Retrieve API Token",
        description: "BotFather will generate an HTTP API access token (e.g. 123456789:ABCdefGhIJKlmNoPQRsTuvw). Copy this token safely.",
        icon: <Key className="w-5 h-5" />,
      },
      {
        title: "Connect Bot Here",
        description: "Click 'Connect Bot', paste your API token in the modal, and submit to finalize the linkage.",
        icon: <Link className="w-5 h-5" />,
      },
    ],
    features: [
      {
        title: "Automate Support",
        description: "Let AI bots handle customer FAQs and routing 24/7.",
        icon: <Sparkles className="w-4 h-4" />,
      },
      {
        title: "Broadcast Campaigns",
        description: "Send promotions, alerts, and newsletters to all subscribers at once.",
        icon: <Award className="w-4 h-4" />,
      },
      {
        title: "Rich Interactive Media",
        description: "Engage users with buttons, menus, and images.",
        icon: <Settings2 className="w-4 h-4" />,
      },
    ],
    proTip: "Never share your Bot API Token in public forums. If your token gets compromised, message @BotFather and run the /revoke command to generate a new token immediately.",
  },
  facebook: {
    title: "Facebook Integration Guide",
    subtitle: "Authorize page access to sync customer inbox communications and capture marketing leads.",
    brandColor: "#1877F2",
    gradientClass: "from-[#1877F2]/10 via-[#1877F2]/5 to-transparent",
    icon: <ShieldCheck className="w-6 h-6 text-[#1877F2]" />,
    requirements: [
      "A personal Facebook Profile",
      "An active Facebook Business Page",
      "Admin permissions on the target Page",
      "Meta Business Portfolio access (recommended)",
    ],
    steps: [
      {
        title: "Initiate Authentication",
        description: "Click 'Connect' to open the secure Meta OAuth authorization popup.",
        icon: <Link className="w-5 h-5" />,
      },
      {
        title: "Select Facebook Pages",
        description: "Select one or more Facebook Business Pages you want to connect to this workspace.",
        icon: <FileText className="w-5 h-5" />,
      },
      {
        title: "Grant Permissions",
        description: "Ensure all permissions (Manage pages, send messages, access leads) are toggled to YES.",
        icon: <ShieldCheck className="w-5 h-5" />,
      },
      {
        title: "Synchronize Inbox",
        description: "Once linked, go to 'Click To WhatsApp Ads' or 'Lead Generation Forms' to begin managing campaigns.",
        icon: <CheckCircle className="w-5 h-5" />,
      },
    ],
    features: [
      {
        title: "Omnichannel Inbox",
        description: "Reply to Facebook comments and Messenger chats directly from the interface.",
        icon: <Sparkles className="w-4 h-4" />,
      },
      {
        title: "Lead Ads Sync",
        description: "Instantly capture leads from Facebook Instant Forms and trigger instant auto-replies.",
        icon: <Award className="w-4 h-4" />,
      },
      {
        title: "Click-to-WhatsApp Ads",
        description: "Launch campaigns that redirect Facebook users to WhatsApp chats smoothly.",
        icon: <Settings2 className="w-4 h-4" />,
      },
    ],
    proTip: "If your Facebook page doesn't appear in the connection list, check your Meta Business Suite settings and make sure your personal account has 'Full Control' or 'Admin access' to that Page.",
  },
  instagram: {
    title: "Instagram Connection Guide",
    subtitle: "Link your Professional Instagram account to engage with followers and automate message replies.",
    brandColor: "#E1306C",
    gradientClass: "from-[#E1306C]/10 via-[#E1306C]/5 to-transparent",
    icon: <Sparkles className="w-6 h-6 text-[#E1306C]" />,
    requirements: [
      "Instagram Business or Creator Account",
      "Linked Facebook Business Page",
      "Admin Access to that linked Facebook Page",
    ],
    steps: [
      {
        title: "Convert to Professional",
        description: "Ensure your Instagram is converted to a Business or Creator account in mobile settings.",
        icon: <Settings2 className="w-5 h-5" />,
      },
      {
        title: "Link Facebook Page",
        description: "Go to your Facebook Page Settings > Linked Accounts > Instagram, and connect your Instagram profile.",
        icon: <Link className="w-5 h-5" />,
      },
      {
        title: "Enable Message Access",
        description: "In Instagram settings, navigate to Privacy > Messages, and turn on 'Allow Access to Messages' under Connected Tools.",
        icon: <ShieldCheck className="w-5 h-5" />,
      },
      {
        title: "Authorize & Sync",
        description: "Click 'Connect' here, authorize through Meta popup, and allow permission for both the Page and Instagram account.",
        icon: <CheckCircle className="w-5 h-5" />,
      },
    ],
    features: [
      {
        title: "DM Automation",
        description: "Run interactive chatbots, send quick replies, and auto-respond to user DMs.",
        icon: <Sparkles className="w-4 h-4" />,
      },
      {
        title: "Comment Auto-Replies",
        description: "Instantly reply to comments on your posts or send them a private DM trigger.",
        icon: <Award className="w-4 h-4" />,
      },
      {
        title: "Profile Syncing",
        description: "Collect user profile data, Instagram handles, and tags inside your contact directory.",
        icon: <Settings2 className="w-4 h-4" />,
      },
    ],
    proTip: "Allowing Access to Messages is a critical security setting. If this toggle is off, Meta will block our servers from receiving incoming DMs, and automation will fail.",
  },
};
