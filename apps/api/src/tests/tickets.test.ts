import request from "supertest";
import { app } from "../index";
import { createTestUser, createTestTicket, getAuthToken } from "./setup";

describe("Tickets API", () => {
  let authToken: string;
  let userId: string;
  let adminToken: string;
  let adminId: string;

  beforeEach(async () => {
    // Crear usuario normal
    const user = await createTestUser({ email: "user@example.com" });
    userId = user.id;
    authToken = getAuthToken(userId);

    // Crear admin
    const admin = await createTestUser({
      email: "admin@example.com",
      role: "ADMIN",
    });
    adminId = admin.id;
    adminToken = getAuthToken(adminId);
  });

  describe("GET /api/tickets", () => {
    it("should get tickets for authenticated user", async () => {
      const response = await request(app)
        .get("/api/tickets")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("data");
      expect(response.body.data).toHaveProperty("pagination");
    });

    it("should reject unauthenticated requests", async () => {
      const response = await request(app).get("/api/tickets");

      expect(response.status).toBe(401);
    });

    it("should filter tickets by status", async () => {
      await createTestTicket({ status: "OPEN", requesterId: userId });
      await createTestTicket({ status: "CLOSED", requesterId: userId });

      const response = await request(app)
        .get("/api/tickets?status=OPEN")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.data).toHaveLength(1);
      expect(response.body.data.data[0].status).toBe("OPEN");
    });

    it("should search tickets by title", async () => {
      await createTestTicket({
        title: "Important Bug",
        requesterId: userId,
      });
      await createTestTicket({
        title: "Feature Request",
        requesterId: userId,
      });

      const response = await request(app)
        .get("/api/tickets?q=Important")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.data).toHaveLength(1);
      expect(response.body.data.data[0].title).toContain("Important");
    });
  });

  describe("POST /api/tickets", () => {
    it("should create new ticket", async () => {
      const ticketData = {
        title: "New Test Ticket",
        description: "Test Description",
        priority: "HIGH",
      };

      const response = await request(app)
        .post("/api/tickets")
        .set("Authorization", `Bearer ${authToken}`)
        .send(ticketData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(ticketData.title);
      expect(response.body.data.requesterId).toBe(userId);
    });

    it("should validate required fields", async () => {
      const response = await request(app)
        .post("/api/tickets")
        .set("Authorization", `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should validate priority values", async () => {
      const response = await request(app)
        .post("/api/tickets")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Test",
          description: "Test",
          priority: "INVALID_PRIORITY",
        });

      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/tickets/:id", () => {
    it("should get ticket by id", async () => {
      const ticket = await createTestTicket({ requesterId: userId });

      const response = await request(app)
        .get(`/api/tickets/${ticket.id}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(ticket.id);
    });

    it("should reject access to other user tickets", async () => {
      const otherUser = await createTestUser({ email: "other@example.com" });
      const ticket = await createTestTicket({ requesterId: otherUser.id });

      const response = await request(app)
        .get(`/api/tickets/${ticket.id}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(403);
    });

    it("should allow admin to access any ticket", async () => {
      const ticket = await createTestTicket({ requesterId: userId });

      const response = await request(app)
        .get(`/api/tickets/${ticket.id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(ticket.id);
    });
  });

  describe("PUT /api/tickets/:id", () => {
    it("should update ticket", async () => {
      const ticket = await createTestTicket({ requesterId: userId });

      const response = await request(app)
        .put(`/api/tickets/${ticket.id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Updated Title",
          description: "Updated Description",
        });

      expect(response.status).toBe(200);
      expect(response.body.data.title).toBe("Updated Title");
    });

    it("should allow admin to update any ticket", async () => {
      const ticket = await createTestTicket({ requesterId: userId });

      const response = await request(app)
        .put(`/api/tickets/${ticket.id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          status: "IN_PROGRESS",
          assigneeId: adminId,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe("IN_PROGRESS");
    });
  });

  describe("DELETE /api/tickets/:id", () => {
    it("should delete own ticket", async () => {
      const ticket = await createTestTicket({ requesterId: userId });

      const response = await request(app)
        .delete(`/api/tickets/${ticket.id}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });

    it("should reject deletion of other user tickets", async () => {
      const otherUser = await createTestUser({ email: "other@example.com" });
      const ticket = await createTestTicket({ requesterId: otherUser.id });

      const response = await request(app)
        .delete(`/api/tickets/${ticket.id}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(403);
    });
  });
});
