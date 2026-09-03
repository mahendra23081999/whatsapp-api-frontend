/* eslint-disable @typescript-eslint/no-explicit-any */
import { ROUTES } from "@/src/constants/route";
import { Button } from "@/src/elements/ui/button";
import { useResendOTPMutation, useResendSignUpOTPMutation, useVerifyOtpMutation, useVerifySignUpOTPMutation } from "@/src/redux/api/authApi";
import { useAppSelector } from "@/src/redux/hooks";
import { OTPVerificationSchema } from "@/src/utils/validationSchema";
import { useFormik } from "formik";
import { ArrowLeft, Clock, Key, Mail, MessageCircle, RefreshCw, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { DynamicLogo } from "./common/DynamicLogo";
import { Skeleton } from "@/src/elements/ui/skeleton";
import { Label } from "@/src/elements/ui/label";
import { Input } from "@/src/elements/ui/input";
import { AuthControls } from "./common/AuthControls";

interface OTPVerificationPageProps {
  type?: "forgot_password" | "signup";
}

export const OTPVerificationPage = ({ type = "forgot_password" }: OTPVerificationPageProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { authRedirectField: identifier } = useAppSelector((state) => state.auth);

  // Forgot password mutations
  const [verifyOtp, { isLoading: isVerifyingForgot }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: isResendingForgot }] = useResendOTPMutation();

  // Signup mutations
  const [verifySignUpOtp, { isLoading: isVerifyingSignUp }] = useVerifySignUpOTPMutation();
  const [resendSignUpOtp, { isLoading: isResendingSignUp }] = useResendSignUpOTPMutation();

  const isLoading = type === "signup" ? isVerifyingSignUp : isVerifyingForgot;
  const isResending = type === "signup" ? isResendingSignUp : isResendingForgot;

  const { authPageSetup, otp_delivery_method } = useAppSelector((state) => state.setting);
  const authContent = authPageSetup?.otp_page;
  const isAuthSetupLoading = !authPageSetup;

  const isWhatsApp = otp_delivery_method === "whatsapp";

  // Fallback content
  const content = {
    title: authContent?.title || (type === "signup" ? t("verify_your_account") : t("enter_verification_code")),
    subtitle: authContent?.subtitle || (isWhatsApp ? t("code_sent_to_whatsapp") : t("code_sent_to")),
    button_text: authContent?.button_text || t("verify_and_continue"),
    resend_text: authContent?.resend_text || t("resend_code_in"),
    footer_text: authContent?.footer_text || "Need help? Contact support@whatsappcrm.com",
    side_panel: {
      title: authContent?.side_panel?.title || (type === "signup" ? t("verify_your_account") : t("verify_email_address_title")),
      description: authContent?.side_panel?.description || t("verification_code_sent_desc"),
      bullets: authContent?.side_panel?.bullets || [
        {
          title: isWhatsApp ? t("check_whatsapp") : t("check_inbox"),
          points: [isWhatsApp ? t("sent_code_to_whatsapp") : t("sent_code_to")]
        },
        { title: t("valid_for_10_mins"), points: [t("code_expires_desc")] },
      ],
      footer: authContent?.side_panel?.footer || []
    }
  };

  const sidePanelIcons = [isWhatsApp ? MessageCircle : Mail, Clock, Shield, Key];
  const sidePanelColors = ["bg-emerald-500", "bg-blue-500", "bg-purple-500", "bg-orange-500"];

  useEffect(() => {
    if (!identifier) {
      router.push(ROUTES.Login);
    }
  }, [identifier, router]);

  const formik = useFormik({
    initialValues: {
      otp: "",
    },
    validationSchema: OTPVerificationSchema,
    onSubmit: async (values) => {
      try {
        if (type === "signup") {
          const response = await verifySignUpOtp({
            identifier: identifier,
            otp: values.otp,
          }).unwrap();
          toast.success(response.message || t("account_verified_success"));
          router.push(ROUTES.Login);
        } else {
          const response = await verifyOtp({
            email: identifier,
            otp: values.otp,
          }).unwrap();
          toast.success(response.message || t("otp_verified_success"));
          router.push(ROUTES.ResetPassword);
        }
      } catch (error: any) {
        toast.error(error?.data?.message || t("otp_invalid"));
      }
    },
  });

  useEffect(() => {
    const isNewRegistration = localStorage.getItem("whatsappcrm_new_registration");
    if (isNewRegistration && type === "signup") {
      const deliveryMethod = otp_delivery_method === "whatsapp" ? "WhatsApp" : "Email";
      toast.success(t("otp_sent_to_method", { method: deliveryMethod }), {
        description: t("check_your_delivery_method", { method: deliveryMethod }),
      });
      localStorage.removeItem("whatsappcrm_new_registration");
    }
  }, [type, otp_delivery_method, t]);

  useEffect(() => {
    inputRefs.current[0]?.focus();

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    const otpString = newOtp.join("");
    formik.setFieldValue("otp", otpString);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split("").forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    setOtp(newOtp);

    const otpString = newOtp.join("");
    formik.setFieldValue("otp", otpString);

    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleResend = async () => {
    try {
      if (type === "signup") {
        const response = await resendSignUpOtp({ identifier }).unwrap();
        toast.success(response.message || t("new_code_sent"));
      } else {
        const response = await resendOtp({ email: identifier }).unwrap();
        toast.success(response.message || t("new_code_sent"));
      }
      setTimer(60);
      setOtp(["", "", "", "", "", ""]);
      formik.setFieldValue("otp", "");
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      toast.error(error?.data?.message || t("resend_code_failed"));
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-emerald-50 dark:bg-none dark:bg-(--page-body-bg) flex items-center justify-center p-2 sm:p-4 relative overflow-hidden">
      <AuthControls />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-200/30 dark:bg-emerald-600/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-200/30 dark:bg-blue-600/15 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md lg:max-w-5xl">
        <div className="grid lg:grid-cols-2 gap-0 items-center">
          <div className="hidden lg:flex flex-col justify-center p-12 bg-linear-to-br from-slate-900 via-slate-800 to-emerald-900 rounded-l-3xl relative overflow-hidden min-h-150">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full -mr-24 -mt-24"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full -ml-32 -mb-32"></div>

            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-3 mb-6">
                <DynamicLogo />
              </div>

              <div>
                <h2 className="text-4xl text-white mb-4 leading-tight">
                  {isAuthSetupLoading ? <Skeleton className="h-10 w-3/4 bg-white/20" /> : content.side_panel.title}
                </h2>
                <div className="text-emerald-100 text-lg">
                  {isAuthSetupLoading ? <Skeleton className="h-6 w-full bg-white/20" /> : content.side_panel.description}
                </div>
              </div>

              <div className="space-y-4">
                {isAuthSetupLoading ? (
                  Array(2).fill(0).map((_, i) => (
                    <div key={i} className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-5">
                      <div className="flex items-start gap-4">
                        <Skeleton className="w-10 h-10 rounded-lg bg-white/20 shrink-0" />
                        <div className="space-y-2 w-full">
                          <Skeleton className="h-5 w-32 bg-white/20" />
                          <Skeleton className="h-4 w-48 bg-white/20" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  content.side_panel.bullets.map((bullet, index) => {
                    const Icon = sidePanelIcons[index % sidePanelIcons.length];
                    const color = sidePanelColors[index % sidePanelColors.length];
                    return (
                      <div key={index} className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-5">
                        <div className="flex items-start gap-4">
                          <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center shrink-0 border border-emerald-500/30`}>
                            <Icon className="w-5 h-5 text-emerald-100" />
                          </div>
                          <div>
                            <p className="text-white font-semibold mb-1">{bullet.title}</p>
                            {bullet.points.map((point, pIndex) => (
                              <p key={pIndex} className="text-emerald-100 text-sm">
                                {point.includes('{email}') ? point.replace('{email}', identifier) : point} {(point === t("sent_code_to") || point === t("sent_code_to_whatsapp")) && <span className="font-semibold">{identifier}</span>}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="pt-4 space-y-4">
                {isAuthSetupLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32 bg-white/20" />
                    <Skeleton className="h-4 w-3/4 bg-white/20" />
                  </div>
                ) : (
                  content.side_panel.footer.map((footerItem, index) => (
                    <div key={index}>
                      <p className="text-emerald-200 text-sm font-medium mb-2">💡 {footerItem.title}</p>
                      <ul className="text-emerald-100 text-sm space-y-1">
                        {footerItem.points.map((point, i) => (
                          <li key={i}>• {point.replace('{email}', identifier)}</li>
                        ))}
                      </ul>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-(--card-color) rounded-3xl lg:rounded-l-none lg:rounded-r-3xl shadow-2xl px-4 py-8 sm:p-12 h-full flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-emerald-100/50 to-teal-100/50 dark:from-emerald-500/20 dark:to-teal-500/20 rounded-bl-full"></div>

            <div className="relative z-10 max-w-md mx-auto w-full">
              <Button onClick={() => router.push(ROUTES.Login)} className="bg-transparent hover:bg-gray-100 dark:hover:bg-(--table-hover) flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-8 transition-colors group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">{t("back_to_login")}</span>
              </Button>

              <div className="lg:hidden flex items-center gap-3 mb-8">
                <DynamicLogo width={140} height={40} className="h-10 w-auto object-contain" skeletonClassName="h-10 w-32" />
              </div>

              <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl text-slate-900 dark:text-white font-bold mb-3">
                  {isAuthSetupLoading ? <Skeleton className="h-9 w-48" /> : content.title}
                </h2>
                <div className="text-slate-600 dark:text-slate-400">
                  {isAuthSetupLoading ? <Skeleton className="h-5 w-64" /> : <>{content.subtitle} <span className="font-semibold text-slate-900 dark:text-white">{identifier}</span></>}
                </div>
              </div>

              <form onSubmit={formik.handleSubmit}>
                <div className="mb-8">
                  <Label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">{t("6_digit_code_label")}</Label>
                  <div className="flex sm:gap-3 gap-1.5 justify-center" onPaste={handlePaste}>
                    {otp.map((digit, index) => (
                      <Input
                        key={index}
                        ref={(el) => {
                          inputRefs.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="sm:w-14 sm:h-14 w-9 h-9 text-center sm:text-2xl text-xl font-bold border border-(--input-border-color) rounded-lg focus:border-primary focus:ring-4 focus:ring-emerald-100 dark:focus:ring-emerald-900/30 outline-none transition-all bg-(--input-color) dark:bg-(--page-body-bg) dark:text-white focus:bg-white dark:focus:bg-(--page-body-bg)"
                      />
                    ))}
                  </div>
                  {formik.touched.otp && formik.errors.otp && <p className="text-sm text-red-500 mt-3 text-center">{formik.errors.otp}</p>}
                </div>

                <div className="mb-4">
                  {timer > 0 ? (
                    <div className="bg-slate-50 dark:bg-(--page-body-bg) border border-(--input-border-color) dark:border-(--card-border-color) rounded-lg p-4 text-center">
                      <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400">
                        <Clock className="w-4 h-4" />
                        <p className="text-sm">
                          {t("resend_code_in")}{" "}
                          <span className="font-bold text-primary">
                            {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, "0")}
                          </span>
                        </p>
                      </div>
                    </div>
                  ) : (
                    <Button onClick={handleResend} disabled={isResending} className="w-full h-12 bg-slate-50 dark:bg-(--page-body-bg) hover:bg-slate-100 dark:hover:bg-(--table-hover) border border-slate-200 dark:border-(--card-border-color) rounded-lg p-4 text-center transition-colors disabled:opacity-50 group">
                      <div className="flex items-center justify-center gap-2 text-slate-700 dark:text-slate-300">
                        <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                        <span className="text-sm font-medium">{isResending ? t("sending_new_code") : t("resend_verification_code")}</span>
                      </div>
                    </Button>
                  )}
                </div>

                <Button type="submit" className="w-full h-12 bg-primary text-white rounded-lg shadow-lg shadow-emerald-500/30 transition-all text-base font-semibold" disabled={isLoading || otp.some((d) => !d) || isAuthSetupLoading}>
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {t("verifying")}
                    </div>
                  ) : isAuthSetupLoading ? (
                    <Skeleton className="h-5 w-32 bg-white/20 mx-auto" />
                  ) : (
                    content.button_text
                  )}
                </Button>
              </form>

              <div className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
                {isAuthSetupLoading ? <Skeleton className="h-4 w-full" /> : content.footer_text}
              </div>

              {type === "signup" && !isAuthSetupLoading && (
                <div className="mt-8 p-4 bg-emerald-50/50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                    {isWhatsApp ? <MessageCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> : <Mail className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-400 mb-0.5">
                      {isWhatsApp ? t("sent_code_to_whatsapp") : t("sent_code_to")}
                    </p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-200/70 leading-relaxed">
                      {t("check_your_delivery_method", { method: isWhatsApp ? "WhatsApp" : t("email_address") })}: <span className="font-bold text-emerald-800 dark:text-emerald-300 underline decoration-emerald-200 dark:decoration-emerald-800 decoration-2 underline-offset-2">{identifier}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
