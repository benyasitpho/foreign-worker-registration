import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  employers: router({
    list: publicProcedure.query(async () => {
      return await db.getEmployers();
    }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getEmployerById(input.id);
      }),

    create: publicProcedure
      .input(
        z.object({
          employerType: z.enum(["individual", "company", "partnership"]),
          companyName: z.string(),
          taxId: z.string(),
          registrationNumber: z.string().optional(),
          contactPerson: z.string().optional(),
          contactPosition: z.string().optional(),
          phone: z.string().optional(),
          email: z.string().optional(),
          fax: z.string().optional(),
          address: z.string().optional(),
          subdistrict: z.string().optional(),
          district: z.string().optional(),
          province: z.string().optional(),
          postalCode: z.string().optional(),
          businessType: z.string().optional(),
          numberOfEmployees: z.number().optional(),
          capitalAmount: z.number().optional(),
          notes: z.string().optional(),
          documentsUrl: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await db.createEmployer(input);
      }),

    update: publicProcedure
      .input(
        z.object({
          id: z.number(),
          data: z.object({
            employerType: z.enum(["individual", "company", "partnership"]).optional(),
            companyName: z.string().optional(),
            taxId: z.string().optional(),
            registrationNumber: z.string().optional(),
            contactPerson: z.string().optional(),
            contactPosition: z.string().optional(),
            phone: z.string().optional(),
            email: z.string().optional(),
            fax: z.string().optional(),
            address: z.string().optional(),
            subdistrict: z.string().optional(),
            district: z.string().optional(),
            province: z.string().optional(),
            postalCode: z.string().optional(),
            businessType: z.string().optional(),
            numberOfEmployees: z.number().optional(),
            capitalAmount: z.number().optional(),
            notes: z.string().optional(),
            documentsUrl: z.string().optional(),
          }),
        })
      )
      .mutation(async ({ input }) => {
        return await db.updateEmployer(input.id, input.data);
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteEmployer(input.id);
        return { success: true };
      }),
  }),

  workers: router({
    list: publicProcedure.query(async () => {
      return await db.getWorkers();
    }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getWorkerById(input.id);
      }),

    getByEmployerId: publicProcedure
      .input(z.object({ employerId: z.number() }))
      .query(async ({ input }) => {
        return await db.getWorkersByEmployerId(input.employerId);
      }),

    create: publicProcedure
      .input(
        z.object({
          title: z.string().optional(),
          fullName: z.string(),
          nationality: z.string(),
          dateOfBirth: z.string().transform((val) => val ? new Date(val) : undefined).optional(),
          gender: z.enum(["male", "female"]).optional(),
          passportNo: z.string(),
          passportIssueDate: z.string().transform((val) => val ? new Date(val) : undefined).optional(),
          passportExpiryDate: z.string().transform((val) => val ? new Date(val) : undefined).optional(),
          visaType: z.string().optional(),
          visaNo: z.string().optional(),
          visaExpiryDate: z.string().transform((val) => val ? new Date(val) : undefined).optional(),
          workPermitNo: z.string().optional(),
          workPermitExpiryDate: z.string().transform((val) => val ? new Date(val) : undefined).optional(),
          addressTh: z.string().optional(),
          subdistrictTh: z.string().optional(),
          districtTh: z.string().optional(),
          provinceTh: z.string().optional(),
          postalCodeTh: z.string().optional(),
          phone: z.string().optional(),
          email: z.string().optional(),
          emergencyContact: z.string().optional(),
          emergencyPhone: z.string().optional(),
          employerId: z.number().optional(),
          employerName: z.string().optional(),
          position: z.string().optional(),
          salary: z.number().optional(),
          workStartDate: z.string().transform((val) => val ? new Date(val) : undefined).optional(),
          workLocation: z.string().optional(),
          jobDescription: z.string().optional(),
          educationLevel: z.string().optional(),
          educationDetails: z.string().optional(),
          bloodType: z.string().optional(),
          allergies: z.string().optional(),
          medicalConditions: z.string().optional(),
          notes: z.string().optional(),
          employmentStatus: z.string().optional(),
          resignationDate: z.string().transform((val) => val ? new Date(val) : undefined).optional(),
          profilePhotoUrl: z.string().optional(),
          documentsUrl: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await db.createWorker(input);
      }),

    update: publicProcedure
      .input(
        z.object({
          id: z.number(),
          data: z.object({
            title: z.string().optional(),
            fullName: z.string().optional(),
            nationality: z.string().optional(),
            dateOfBirth: z.string().transform((val) => val ? new Date(val) : undefined).optional(),
            gender: z.enum(["male", "female"]).optional(),
            passportNo: z.string().optional(),
            passportIssueDate: z.string().transform((val) => val ? new Date(val) : undefined).optional(),
            passportExpiryDate: z.string().transform((val) => val ? new Date(val) : undefined).optional(),
            visaType: z.string().optional(),
            visaNo: z.string().optional(),
            visaExpiryDate: z.string().transform((val) => val ? new Date(val) : undefined).optional(),
            workPermitNo: z.string().optional(),
            workPermitExpiryDate: z.string().transform((val) => val ? new Date(val) : undefined).optional(),
            addressTh: z.string().optional(),
            subdistrictTh: z.string().optional(),
            districtTh: z.string().optional(),
            provinceTh: z.string().optional(),
            postalCodeTh: z.string().optional(),
            phone: z.string().optional(),
            email: z.string().optional(),
            emergencyContact: z.string().optional(),
            emergencyPhone: z.string().optional(),
            employerId: z.number().optional(),
            employerName: z.string().optional(),
            position: z.string().optional(),
            salary: z.number().optional(),
            workStartDate: z.string().transform((val) => val ? new Date(val) : undefined).optional(),
            workLocation: z.string().optional(),
            jobDescription: z.string().optional(),
            educationLevel: z.string().optional(),
            educationDetails: z.string().optional(),
            bloodType: z.string().optional(),
            allergies: z.string().optional(),
            medicalConditions: z.string().optional(),
            notes: z.string().optional(),
            employmentStatus: z.string().optional(),
            resignationDate: z.string().transform((val) => val ? new Date(val) : undefined).optional(),
            profilePhotoUrl: z.string().optional(),
            documentsUrl: z.string().optional(),
          }),
        })
      )
      .mutation(async ({ input }) => {
        return await db.updateWorker(input.id, input.data);
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteWorker(input.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
