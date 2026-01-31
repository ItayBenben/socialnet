import { Router } from 'express';
import {
  createComment,
  getAllComments,
  getCommentById,
  updateComment,
  deleteComment,
} from '../controllers/commentController';

const router = Router();

/**
 * @swagger
 * /comment:
 *   post:
 *     summary: Create a new comment
 *     tags: [Comments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - postId
 *               - author
 *             properties:
 *               content:
 *                 type: string
 *               postId:
 *                 type: string
 *                 description: Post ID to comment on
 *               author:
 *                 type: string
 *                 description: User ID of the author
 *     responses:
 *       201:
 *         description: Comment created successfully
 *       400:
 *         description: Missing required fields
 */
router.post('/', createComment);

/**
 * @swagger
 * /comment:
 *   get:
 *     summary: Get all comments
 *     tags: [Comments]
 *     parameters:
 *       - in: query
 *         name: postId
 *         schema:
 *           type: string
 *         description: Filter by post ID
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         description: Filter by author ID
 *     responses:
 *       200:
 *         description: List of comments
 */
router.get('/', getAllComments);

/**
 * @swagger
 * /comment/{id}:
 *   get:
 *     summary: Get comment by ID
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment details
 *       404:
 *         description: Comment not found
 */
router.get('/:id', getCommentById);

/**
 * @swagger
 * /comment/{id}:
 *   put:
 *     summary: Update comment
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *               author:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       404:
 *         description: Comment not found
 */
router.put('/:id', updateComment);

/**
 * @swagger
 * /comment/{id}:
 *   delete:
 *     summary: Delete comment
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       404:
 *         description: Comment not found
 */
router.delete('/:id', deleteComment);

export default router;
