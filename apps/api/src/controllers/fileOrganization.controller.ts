import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import FileOrganizationService from "../services/fileOrganization.service";
import { ApiError } from "../lib/errors";

export class FileOrganizationController {
  /**
   * Crear una nueva categoría
   */
  static createCategory = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      // Solo admins pueden crear categorías
      if (req.user?.role !== "ADMIN") {
        throw new ApiError(
          "FORBIDDEN",
          "Solo los administradores pueden crear categorías",
          403,
        );
      }

      const category = await FileOrganizationService.createCategory(req.body);
      res.status(201).json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtener todas las categorías
   */
  static getCategories = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const categories = await FileOrganizationService.getCategories();
      res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtener categorías con estructura jerárquica
   */
  static getCategoriesHierarchy = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const categories = await FileOrganizationService.getCategoriesHierarchy();
      res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Crear una nueva etiqueta
   */
  static createTag = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      // Solo admins pueden crear etiquetas
      if (req.user?.role !== "ADMIN") {
        throw new ApiError(
          "FORBIDDEN",
          "Solo los administradores pueden crear etiquetas",
          403,
        );
      }

      const tag = await FileOrganizationService.createTag(req.body);
      res.status(201).json({
        success: true,
        data: tag,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtener todas las etiquetas
   */
  static getTags = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const tags = await FileOrganizationService.getTags();
      res.json({
        success: true,
        data: tags,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Organizar un archivo
   */
  static organizeFile = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { attachmentId } = req.params;
      const organization = await FileOrganizationService.organizeFile({
        attachmentId,
        ...req.body,
      });

      res.json({
        success: true,
        data: organization,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtener archivos por categoría
   */
  static getFilesByCategory = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { categoryId } = req.params;
      const files =
        await FileOrganizationService.getFilesByCategory(categoryId);

      res.json({
        success: true,
        data: files,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtener archivos por etiqueta
   */
  static getFilesByTag = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { categoryId } = req.params;
      const files = await FileOrganizationService.getFilesByTag(categoryId);

      res.json({
        success: true,
        data: files,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Buscar archivos
   */
  static searchFiles = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { query } = req.query;
      const files = await FileOrganizationService.searchFiles(query as string);

      res.json({
        success: true,
        data: files,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtener estadísticas de organización
   */
  static getOrganizationStats = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      // Solo admins pueden ver estadísticas
      if (req.user?.role !== "ADMIN") {
        throw new ApiError(
          "FORBIDDEN",
          "Solo los administradores pueden ver estadísticas",
          403,
        );
      }

      const stats = await FileOrganizationService.getOrganizationStats();
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Eliminar una categoría
   */
  static deleteCategory = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      // Solo admins pueden eliminar categorías
      if (req.user?.role !== "ADMIN") {
        throw new ApiError(
          "FORBIDDEN",
          "Solo los administradores pueden eliminar categorías",
          403,
        );
      }

      const { categoryId } = req.params;
      await FileOrganizationService.deleteCategory(categoryId);

      res.json({
        success: true,
        message: "Categoría eliminada correctamente",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Eliminar una etiqueta
   */
  static deleteTag = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { tagId } = req.params;

      await FileOrganizationService.deleteTag(tagId);

      res.json({
        success: true,
        message: "Etiqueta eliminada exitosamente",
      });
    } catch (error) {
      next(error);
    }
  };

  static updateCategory = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { categoryId } = req.params;
      const { name, description, color, icon, parentId } = req.body;

      const updatedCategory = await FileOrganizationService.updateCategory(
        categoryId,
        {
          name,
          description,
          color,
          icon,
          parentId: parentId || null,
        },
      );

      res.json({
        success: true,
        category: updatedCategory,
        message: "Categoría actualizada exitosamente",
      });
    } catch (error) {
      next(error);
    }
  };

  static updateTag = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { tagId } = req.params;
      const { name, description, color } = req.body;

      const updatedTag = await FileOrganizationService.updateTag(tagId, {
        name,
        description,
        color,
      });

      res.json({
        success: true,
        tag: updatedTag,
        message: "Etiqueta actualizada exitosamente",
      });
    } catch (error) {
      next(error);
    }
  };
}

export default FileOrganizationController;
