"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTaskAssignments = exports.updateTaskAssignments = exports.validateProjectMembers = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const validateProjectMembers = async (projectId, userIds) => {
    if (userIds.length === 0)
        return true;
    const project = await prisma_1.default.project.findUnique({
        where: { id: projectId },
        select: { ownerId: true },
    });
    if (!project)
        return false;
    const remainingIds = userIds.filter((id) => id !== project.ownerId);
    if (remainingIds.length === 0)
        return true;
    const projectMembers = await prisma_1.default.projectMember.findMany({
        where: {
            projectId,
            userId: { in: remainingIds },
        },
    });
    return projectMembers.length === remainingIds.length;
};
exports.validateProjectMembers = validateProjectMembers;
const updateTaskAssignments = async (taskId, assigneeIds) => {
    await prisma_1.default.taskAssignee.deleteMany({
        where: { taskId },
    });
    if (assigneeIds.length > 0) {
        await prisma_1.default.taskAssignee.createMany({
            data: assigneeIds.map((userId) => ({
                taskId,
                userId,
            })),
        });
    }
};
exports.updateTaskAssignments = updateTaskAssignments;
const getTaskAssignments = async (taskId) => {
    const assignees = await prisma_1.default.taskAssignee.findMany({
        where: { taskId },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    name: true,
                },
            },
        },
    });
    return assignees.map((assignee) => ({
        id: assignee.id,
        assignedAt: assignee.assignedAt,
        user: assignee.user,
    }));
};
exports.getTaskAssignments = getTaskAssignments;
//# sourceMappingURL=taskAssignments.js.map