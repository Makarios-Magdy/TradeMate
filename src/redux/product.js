// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define a service using a base URL and expected endpoints
export const productApi = createApi({
  reducerPath: "productApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:1337/api/" }),
  endpoints: (builder) => ({
    getproductByName: builder.query({
      query: (name) => `${name}`,
    }),
    // Register mutation
    register: builder.mutation({
      query: (credentials) => ({
        url: "auth/local/register",
        method: "POST",
        body: credentials,
      }),
    }),
    // Login mutation
    login: builder.mutation({
      query: (credentials) => ({
        url: "auth/local",
        method: "POST",
        body: credentials,
      }),
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetproductByNameQuery,
  useRegisterMutation,
  useLoginMutation,
} = productApi;
