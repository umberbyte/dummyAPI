// In-memory data store for stateful CRUD testing in dummyAPI

export const createInitialState = () => ({
  users: [
    { id: "usr_1", name: "Alice Tanaka", email: "alice@example.com", role: "admin", createdAt: "2026-01-15T09:00:00Z" },
    { id: "usr_2", name: "Bob Sato", email: "bob@example.com", role: "user", createdAt: "2026-02-01T10:30:00Z" },
    { id: "usr_3", name: "Charlie Suzuki", email: "charlie@example.com", role: "user", createdAt: "2026-03-10T14:15:00Z" }
  ],
  products: [
    { id: "prod_101", name: "UltraBook Pro 14", category: "Electronics", price: 188000, stock: 24, description: "High-performance laptop for developers" },
    { id: "prod_102", name: "Noise Cancelling Headphone", category: "Audio", price: 34800, stock: 50, description: "Active ANC with 40h battery life" },
    { id: "prod_103", name: "Ergonomic Mechanical Keyboard", category: "Accessories", price: 22000, stock: 15, description: "Custom mechanical switch split keyboard" }
  ],
  cart: [
    { itemId: "cart_item_1", productId: "prod_102", quantity: 1, addedAt: "2026-09-28T08:00:00Z" }
  ],
  orders: [
    {
      id: "ord_9001",
      userId: "usr_1",
      status: "completed",
      totalAmount: 34800,
      items: [{ productId: "prod_102", quantity: 1, price: 34800 }],
      createdAt: "2026-09-25T11:20:00Z"
    }
  ],
  posts: [
    {
      id: "post_1",
      slug: "getting-started-with-api-testing",
      title: "Getting Started with API Testing",
      content: "API testing is an essential part of continuous integration...",
      authorId: "usr_1",
      tags: ["api", "testing", "devops"],
      likes: 42,
      createdAt: "2026-09-20T12:00:00Z"
    }
  ],
  comments: [
    { id: "cmt_1", postId: "post_1", userId: "usr_2", text: "Great post! Very helpful.", createdAt: "2026-09-20T13:30:00Z" }
  ],
  projects: [
    { id: "proj_1", name: "dummyAPI Release v1.0", description: "All-in-one API stub service", status: "active", createdAt: "2026-09-28T00:00:00Z" }
  ],
  tasks: [
    { id: "task_1", projectId: "proj_1", title: "Build Docker Image", status: "in_progress", assigneeId: "usr_1" },
    { id: "task_2", projectId: "proj_1", title: "Write OpenAPI spec & UI", status: "done", assigneeId: "usr_2" }
  ],
  files: [
    { id: "file_101", filename: "invoice-2026-09.pdf", sizeBytes: 1048576, mimeType: "application/pdf", uploadedAt: "2026-09-28T05:00:00Z" }
  ]
});

export const db = createInitialState();

export const resetDb = () => {
  const initial = createInitialState();
  Object.keys(db).forEach(key => delete db[key]);
  Object.assign(db, initial);
  return db;
};
