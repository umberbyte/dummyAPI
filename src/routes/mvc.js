import express from "express";
import { db } from "../store/memoryDb.js";

const router = express.Router();

// ----------------------------------------------------
// 1. Auth & Users
// ----------------------------------------------------
router.post("/auth/register", (req, res) => {
  const { name, email, password } = req.body || {};
  const newUser = {
    id: `usr_${Date.now()}`,
    name: name || "New User",
    email: email || `user_${Date.now()}@example.com`,
    role: "user",
    createdAt: new Date().toISOString()
  };
  db.users.push(newUser);
  res.status(201).json({
    message: "User registered successfully",
    user: newUser,
    token: `dummy_jwt_token_${newUser.id}`
  });
});

router.post("/auth/login", (req, res) => {
  const { email } = req.body || {};
  const user = db.users.find(u => u.email === email) || db.users[0];
  res.json({
    message: "Login successful",
    token: `dummy_jwt_token_${user.id}`,
    refreshToken: `dummy_refresh_${user.id}`,
    expiresIn: 3600,
    user
  });
});

router.post("/auth/logout", (req, res) => {
  res.json({ message: "Logout successful" });
});

router.get("/users/me", (req, res) => {
  res.json(db.users[0]);
});

router.patch("/users/me", (req, res) => {
  const me = db.users[0];
  if (req.body.name) me.name = req.body.name;
  if (req.body.email) me.email = req.body.email;
  res.json({ message: "Profile updated", user: me });
});

router.put("/users/me/password", (req, res) => {
  res.json({ message: "Password updated successfully" });
});

router.delete("/users/me", (req, res) => {
  res.json({ message: "User account deactivated (soft deleted)" });
});

router.get("/users", (req, res) => {
  const page = parseInt(req.query.page || "1", 10);
  const limit = parseInt(req.query.limit || "10", 10);
  res.json({
    data: db.users,
    pagination: { page, limit, total: db.users.length }
  });
});

router.get("/users/:id", (req, res) => {
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

router.patch("/users/:id/role", (req, res) => {
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  user.role = req.body.role || "user";
  res.json({ message: "User role updated", user });
});

// ----------------------------------------------------
// 2. Products, Cart & Orders
// ----------------------------------------------------
router.get("/products", (req, res) => {
  const { category, search } = req.query;
  let items = db.products;
  if (category) items = items.filter(p => p.category.toLowerCase() === category.toLowerCase());
  if (search) items = items.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  res.json({ products: items, total: items.length });
});

router.get("/products/:id", (req, res) => {
  const product = db.products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
});

router.post("/products", (req, res) => {
  const newProduct = {
    id: `prod_${Date.now()}`,
    name: req.body.name || "Sample Product",
    category: req.body.category || "General",
    price: Number(req.body.price) || 1000,
    stock: Number(req.body.stock) || 10,
    description: req.body.description || ""
  };
  db.products.push(newProduct);
  res.status(201).json(newProduct);
});

router.put("/products/:id", (req, res) => {
  const idx = db.products.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Product not found" });
  db.products[idx] = { ...db.products[idx], ...req.body, id: req.params.id };
  res.json(db.products[idx]);
});

router.delete("/products/:id", (req, res) => {
  const idx = db.products.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Product not found" });
  const removed = db.products.splice(idx, 1);
  res.json({ message: "Product deleted", product: removed[0] });
});

router.get("/cart", (req, res) => {
  const detailedItems = db.cart.map(item => {
    const prod = db.products.find(p => p.id === item.productId);
    return { ...item, product: prod };
  });
  const subtotal = detailedItems.reduce((acc, curr) => acc + (curr.product?.price || 0) * curr.quantity, 0);
  res.json({ items: detailedItems, subtotal, currency: "JPY" });
});

router.post("/cart/items", (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const existing = db.cart.find(c => c.productId === productId);
  if (existing) {
    existing.quantity += Number(quantity);
    return res.json({ message: "Cart item quantity updated", item: existing });
  }
  const newItem = {
    itemId: `cart_item_${Date.now()}`,
    productId,
    quantity: Number(quantity),
    addedAt: new Date().toISOString()
  };
  db.cart.push(newItem);
  res.status(201).json(newItem);
});

router.patch("/cart/items/:itemId", (req, res) => {
  const item = db.cart.find(c => c.itemId === req.params.itemId);
  if (!item) return res.status(404).json({ error: "Cart item not found" });
  if (req.body.quantity !== undefined) item.quantity = Number(req.body.quantity);
  res.json(item);
});

router.delete("/cart/items/:itemId", (req, res) => {
  const idx = db.cart.findIndex(c => c.itemId === req.params.itemId);
  if (idx === -1) return res.status(404).json({ error: "Cart item not found" });
  db.cart.splice(idx, 1);
  res.json({ message: "Item removed from cart" });
});

router.post("/orders", (req, res) => {
  const newOrder = {
    id: `ord_${Date.now()}`,
    userId: req.body.userId || "usr_1",
    status: "processing",
    totalAmount: req.body.totalAmount || 34800,
    items: req.body.items || db.cart,
    createdAt: new Date().toISOString()
  };
  db.orders.push(newOrder);
  db.cart = []; // Empty cart on checkout
  res.status(201).json(newOrder);
});

router.get("/orders", (req, res) => {
  res.json({ orders: db.orders, total: db.orders.length });
});

router.get("/orders/:id", (req, res) => {
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json(order);
});

router.post("/orders/:id/cancel", (req, res) => {
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  order.status = "cancelled";
  res.json({ message: "Order cancelled", order });
});

// ----------------------------------------------------
// 3. Posts, Comments & Likes
// ----------------------------------------------------
router.get("/posts", (req, res) => {
  res.json({ posts: db.posts, total: db.posts.length });
});

router.post("/posts", (req, res) => {
  const newPost = {
    id: `post_${Date.now()}`,
    slug: (req.body.title || "new-post").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    title: req.body.title || "Untitled Post",
    content: req.body.content || "",
    authorId: req.body.authorId || "usr_1",
    tags: req.body.tags || ["general"],
    likes: 0,
    createdAt: new Date().toISOString()
  };
  db.posts.push(newPost);
  res.status(201).json(newPost);
});

router.get("/posts/:idOrSlug", (req, res) => {
  const post = db.posts.find(p => p.id === req.params.idOrSlug || p.slug === req.params.idOrSlug);
  if (!post) return res.status(404).json({ error: "Post not found" });
  res.json(post);
});

router.put("/posts/:id", (req, res) => {
  const post = db.posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });
  Object.assign(post, req.body);
  res.json(post);
});

router.delete("/posts/:id", (req, res) => {
  const idx = db.posts.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Post not found" });
  db.posts.splice(idx, 1);
  res.json({ message: "Post deleted" });
});

router.get("/posts/:id/comments", (req, res) => {
  const comments = db.comments.filter(c => c.postId === req.params.id);
  res.json({ comments });
});

router.post("/posts/:id/comments", (req, res) => {
  const newComment = {
    id: `cmt_${Date.now()}`,
    postId: req.params.id,
    userId: req.body.userId || "usr_1",
    text: req.body.text || "Sample comment",
    createdAt: new Date().toISOString()
  };
  db.comments.push(newComment);
  res.status(201).json(newComment);
});

router.delete("/comments/:id", (req, res) => {
  const idx = db.comments.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Comment not found" });
  db.comments.splice(idx, 1);
  res.json({ message: "Comment deleted" });
});

router.post("/posts/:id/like", (req, res) => {
  const post = db.posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });
  post.likes = (post.likes || 0) + 1;
  res.json({ message: "Liked post", likes: post.likes });
});

router.delete("/posts/:id/like", (req, res) => {
  const post = db.posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });
  post.likes = Math.max(0, (post.likes || 0) - 1);
  res.json({ message: "Unliked post", likes: post.likes });
});

// ----------------------------------------------------
// 4. Projects & Tasks
// ----------------------------------------------------
router.get("/projects", (req, res) => {
  res.json({ projects: db.projects });
});

router.post("/projects", (req, res) => {
  const newProject = {
    id: `proj_${Date.now()}`,
    name: req.body.name || "New Project",
    description: req.body.description || "",
    status: "active",
    createdAt: new Date().toISOString()
  };
  db.projects.push(newProject);
  res.status(201).json(newProject);
});

router.get("/projects/:id/tasks", (req, res) => {
  const tasks = db.tasks.filter(t => t.projectId === req.params.id);
  res.json({ tasks });
});

router.post("/projects/:id/tasks", (req, res) => {
  const newTask = {
    id: `task_${Date.now()}`,
    projectId: req.params.id,
    title: req.body.title || "New Task",
    status: req.body.status || "todo",
    assigneeId: req.body.assigneeId || null
  };
  db.tasks.push(newTask);
  res.status(201).json(newTask);
});

router.patch("/tasks/:id/status", (req, res) => {
  const task = db.tasks.find(t => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: "Task not found" });
  task.status = req.body.status || task.status;
  res.json(task);
});

// ----------------------------------------------------
// 5. Uploads & Files
// ----------------------------------------------------
router.post("/uploads/presigned-url", (req, res) => {
  const { filename, contentType } = req.body || {};
  const uploadId = `upload_${Date.now()}`;
  res.json({
    uploadUrl: `https://dummy-s3-bucket.s3.amazonaws.com/uploads/${uploadId}/${filename || "file.bin"}`,
    method: "PUT",
    headers: { "Content-Type": contentType || "application/octet-stream" },
    fileKey: `uploads/${uploadId}/${filename || "file.bin"}`,
    expiresIn: 900
  });
});

router.post("/files", (req, res) => {
  const newFile = {
    id: `file_${Date.now()}`,
    filename: req.body.filename || "uploaded_sample.png",
    sizeBytes: req.body.sizeBytes || 245760,
    mimeType: req.body.mimeType || "image/png",
    uploadedAt: new Date().toISOString()
  };
  db.files.push(newFile);
  res.status(201).json(newFile);
});

router.get("/files", (req, res) => {
  res.json({ files: db.files });
});

router.get("/files/:id", (req, res) => {
  const file = db.files.find(f => f.id === req.params.id);
  if (!file) return res.status(404).json({ error: "File not found" });
  res.json(file);
});

router.delete("/files/:id", (req, res) => {
  const idx = db.files.findIndex(f => f.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "File not found" });
  db.files.splice(idx, 1);
  res.json({ message: "File deleted successfully" });
});

export default router;
