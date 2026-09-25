"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTaskComments = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const getTaskComments = async (taskId) => {
    const comments = await prisma_1.default.comment.findMany({
        where: { taskId },
        include: {
            author: {
                select: {
                    id: true,
                    email: true,
                    name: true,
                },
            },
        },
        orderBy: { createdAt: "asc" },
    });
    return comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        author: comment.author,
    }));
};
exports.getTaskComments = getTaskComments;
//# sourceMappingURL=taskComments.js.map