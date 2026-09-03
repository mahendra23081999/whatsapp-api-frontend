import { baseApi } from "./baseApi";

export const campaignApi = baseApi.enhanceEndpoints({ addTagTypes: ["Campaign"] }).injectEndpoints({
  endpoints: (builder) => ({
    getCampaigns: builder.query({
      query: (params) => ({
        url: "/campaigns",
        params,
      }),
      providesTags: ["Campaign"],
    }),
    getCampaignById: builder.query({
      query: (id) => ({
        url: `/campaigns/${id}`,
      }),
      providesTags: (result, error, id) => [{ type: "Campaign", id }],
    }),
    createCampaign: builder.mutation({
      query: (data) => ({
        url: "/campaigns",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Campaign"],
    }),
    updateCampaign: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/campaigns/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => ["Campaign", { type: "Campaign", id }],
    }),
    deleteCampaign: builder.mutation({
      query: (ids) => ({
        url: "/campaigns/bulk-delete",
        method: "DELETE",
        body: { ids },
      }),
      invalidatesTags: ["Campaign"],
    }),
    deleteCampaignById: builder.mutation({
      query: (id) => ({
        url: `/campaigns/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Campaign"],
    }),
    togglePauseCampaign: builder.mutation({
      query: (id) => ({
        url: `/campaigns/${id}/toggle-pause`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => ["Campaign", { type: "Campaign", id }],
    }),
    resendCampaign: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/campaigns/${id}/resend`,
        method: "POST",
        body: Object.keys(body).length ? body : { is_scheduled: false },
      }),
      invalidatesTags: ["Campaign"],
    }),
    publishCampaign: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/campaigns/${id}/publish`,
        method: "POST",
        body
      }),
      invalidatesTags: (result, error, id) => ["Campaign", { type: "Campaign", id }],
    }),
  }),
});

export const {
  useGetCampaignsQuery,
  useGetCampaignByIdQuery,
  useCreateCampaignMutation,
  useUpdateCampaignMutation,
  useDeleteCampaignMutation,
  useDeleteCampaignByIdMutation,
  useTogglePauseCampaignMutation,
  useResendCampaignMutation,
  usePublishCampaignMutation,
} = campaignApi;
