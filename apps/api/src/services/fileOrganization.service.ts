import { prisma } from "../lib/database";
import { ApiError } from "../lib/errors";

export interface FileCategory {
  id: string;
  name: string;
  description?: string | null;
  color?: string;
  icon?: string;
  parentId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface FileTag {
  id: string;
  name: string;
  color?: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface FileOrganization {
  id: string;
  attachmentId: string;
  categoryId?: string | null;
  tags: string[];
  customPath?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class FileOrganizationService {
  /**
   * Crea una nueva categoría de archivos
   */
  static async createCategory(data: {
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    parentId?: string;
  }): Promise<FileCategory> {
    // Verificar que el nombre sea único
    const existing = await prisma.fileCategory.findFirst({
      where: { name: data.name },
    });

    if (existing) {
      throw new ApiError(
        "CATEGORY_EXISTS",
        "Ya existe una categoría con ese nombre",
        400,
      );
    }

    // Verificar que el parentId existe si se proporciona
    if (data.parentId) {
      const parentExists = await prisma.fileCategory.findUnique({
        where: { id: data.parentId },
      });

      if (!parentExists) {
        throw new ApiError(
          "PARENT_NOT_FOUND",
          "La categoría padre especificada no existe",
          400,
        );
      }
    }

    return await prisma.fileCategory.create({
      data: {
        name: data.name,
        description: data.description,
        color: data.color || "#3B82F6",
        icon: data.icon || "📁",
        parentId: data.parentId || null,
      },
    });
  }

  /**
   * Obtiene todas las categorías
   */
  static async getCategories(): Promise<FileCategory[]> {
    return await prisma.fileCategory.findMany({
      orderBy: { name: "asc" },
    });
  }

  /**
   * Obtiene categorías con estructura jerárquica
   */
  static async getCategoriesHierarchy(): Promise<FileCategory[]> {
    const categories = await prisma.fileCategory.findMany({
      orderBy: { name: "asc" },
    });

    // Construir jerarquía
    const categoryMap = new Map<
      string,
      FileCategory & { children: FileCategory[] }
    >();
    const rootCategories: (FileCategory & { children: FileCategory[] })[] = [];

    // Inicializar todas las categorías con array de hijos vacío
    categories.forEach((cat) => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    // Construir jerarquía
    categories.forEach((cat) => {
      if (cat.parentId) {
        const parent = categoryMap.get(cat.parentId);
        if (parent) {
          parent.children.push(cat);
        }
      } else {
        const rootCat = categoryMap.get(cat.id);
        if (rootCat) {
          rootCategories.push(rootCat);
        }
      }
    });

    return rootCategories;
  }

  /**
   * Crea una nueva etiqueta
   */
  static async createTag(data: {
    name: string;
    color?: string;
    description?: string;
  }): Promise<FileTag> {
    // Verificar que el nombre sea único
    const existing = await prisma.fileTag.findFirst({
      where: { name: data.name },
    });

    if (existing) {
      throw new ApiError(
        "TAG_EXISTS",
        "Ya existe una etiqueta con ese nombre",
        400,
      );
    }

    return await prisma.fileTag.create({
      data: {
        name: data.name,
        color: data.color || "#6B7280",
        description: data.description,
      },
    });
  }

  /**
   * Obtiene todas las etiquetas
   */
  static async getTags(): Promise<FileTag[]> {
    return await prisma.fileTag.findMany({
      orderBy: { name: "asc" },
    });
  }

  /**
   * Organiza un archivo (asigna categoría y etiquetas)
   */
  static async organizeFile(data: {
    attachmentId: string;
    categoryId?: string;
    tags?: string[];
    customPath?: string;
  }): Promise<FileOrganization> {
    // Verificar que el archivo existe
    const attachment = await prisma.attachment.findUnique({
      where: { id: data.attachmentId },
    });

    if (!attachment) {
      throw new ApiError("ATTACHMENT_NOT_FOUND", "Archivo no encontrado", 404);
    }

    // Verificar que la categoría existe si se proporciona
    if (data.categoryId) {
      const category = await prisma.fileCategory.findUnique({
        where: { id: data.categoryId },
      });

      if (!category) {
        throw new ApiError(
          "CATEGORY_NOT_FOUND",
          "Categoría no encontrada",
          404,
        );
      }
    }

    // Crear o actualizar organización
    const existing = await prisma.fileOrganization.findUnique({
      where: { attachmentId: data.attachmentId },
    });

    if (existing) {
      return await prisma.fileOrganization.update({
        where: { id: existing.id },
        data: {
          categoryId: data.categoryId,
          tags: data.tags || [],
          customPath: data.customPath,
        },
      });
    } else {
      return await prisma.fileOrganization.create({
        data: {
          attachmentId: data.attachmentId,
          categoryId: data.categoryId,
          tags: data.tags || [],
          customPath: data.customPath,
        },
      });
    }
  }

  /**
   * Obtiene archivos organizados por categoría
   */
  static async getFilesByCategory(categoryId: string): Promise<any[]> {
    return await prisma.attachment.findMany({
      where: {
        organizations: {
          some: {
            categoryId: categoryId,
          },
        },
      },
      include: {
        organizations: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  /**
   * Obtiene archivos organizados por etiqueta
   */
  static async getFilesByTag(tagName: string): Promise<any[]> {
    return await prisma.attachment.findMany({
      where: {
        organizations: {
          some: {
            tags: {
              has: tagName,
            },
          },
        },
      },
      include: {
        organizations: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  /**
   * Busca archivos por texto
   */
  static async searchFiles(query: string): Promise<any[]> {
    const attachments = await prisma.attachment.findMany({
      where: {
        OR: [
          { fileName: { contains: query, mode: "insensitive" } },
          { mimeType: { contains: query, mode: "insensitive" } },
          {
            organizations: {
              some: {
                OR: [
                  {
                    category: {
                      name: { contains: query, mode: "insensitive" },
                    },
                  },
                  {
                    tags: {
                      has: query,
                    },
                  },
                ],
              },
            },
          },
        ],
      },
      include: {
        organizations: {
          include: {
            category: true,
          },
        },
      },
    });

    // Transformar los datos para incluir category y tags directamente en el archivo
    return attachments.map((attachment) => {
      const organization = attachment.organizations[0]; // Tomar la primera organización
      return {
        id: attachment.id,
        fileName: attachment.fileName,
        mimeType: attachment.mimeType,
        sizeBytes: attachment.sizeBytes,
        storageUrl: attachment.storageUrl,
        createdAt: attachment.createdAt,
        category: organization?.category || null,
        tags: organization?.tags || [],
      };
    });
  }

  /**
   * Obtiene estadísticas de organización
   */
  static async getOrganizationStats(): Promise<{
    totalFiles: number;
    categorizedFiles: number;
    taggedFiles: number;
    categoryCount: number;
    tagCount: number;
  }> {
    const [totalFiles, categorizedFiles, taggedFiles, categoryCount, tagCount] =
      await Promise.all([
        prisma.attachment.count(),
        prisma.fileOrganization.count({
          where: { categoryId: { not: null } },
        }),
        prisma.fileOrganization.count({
          where: { tags: { isEmpty: false } },
        }),
        prisma.fileCategory.count(),
        prisma.fileTag.count(),
      ]);

    return {
      totalFiles,
      categorizedFiles,
      taggedFiles,
      categoryCount,
      tagCount,
    };
  }

  /**
   * Elimina una categoría
   */
  static async deleteCategory(categoryId: string): Promise<void> {
    // Verificar que no haya archivos usando esta categoría
    const filesUsingCategory = await prisma.fileOrganization.count({
      where: { categoryId },
    });

    if (filesUsingCategory > 0) {
      throw new ApiError(
        "CATEGORY_IN_USE",
        "No se puede eliminar una categoría que tiene archivos asignados",
        400,
      );
    }

    await prisma.fileCategory.delete({
      where: { id: categoryId },
    });
  }

  /**
   * Elimina una etiqueta
   */
  static async deleteTag(tagId: string): Promise<void> {
    await prisma.fileTag.delete({
      where: { id: tagId },
    });
  }

  static async updateCategory(
    categoryId: string,
    data: {
      name: string;
      description?: string | null;
      color: string;
      icon: string;
      parentId?: string | null;
    },
  ): Promise<FileCategory> {
    return await prisma.fileCategory.update({
      where: { id: categoryId },
      data: {
        name: data.name,
        description: data.description,
        color: data.color,
        icon: data.icon,
        parentId: data.parentId,
      },
    });
  }

  static async updateTag(
    tagId: string,
    data: {
      name: string;
      description?: string | null;
      color: string;
    },
  ): Promise<FileTag> {
    return await prisma.fileTag.update({
      where: { id: tagId },
      data: {
        name: data.name,
        description: data.description,
        color: data.color,
      },
    });
  }
}

export default FileOrganizationService;
