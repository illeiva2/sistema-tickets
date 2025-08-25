import { prisma } from "../lib/database";
import FileOrganizationService from "../services/fileOrganization.service";

async function createDemoData() {
  console.log(
    "🚀 Creando datos de demostración para organización de archivos...",
  );

  try {
    // Crear categorías de ejemplo
    const categories = [
      {
        name: "Documentos",
        description: "Documentos oficiales y reportes",
        color: "#3B82F6",
        icon: "📄",
      },
      {
        name: "Imágenes",
        description: "Capturas de pantalla y fotos",
        color: "#10B981",
        icon: "🖼️",
      },
      {
        name: "Archivos",
        description: "Archivos comprimidos y backups",
        color: "#F59E0B",
        icon: "📦",
      },
      {
        name: "Código",
        description: "Scripts y archivos de programación",
        color: "#8B5CF6",
        icon: "💻",
      },
      {
        name: "Facturas",
        description: "Facturas y documentos financieros",
        color: "#EF4444",
        icon: "🧾",
      },
    ];

    console.log("📁 Creando categorías...");
    const createdCategories = [];

    for (const categoryData of categories) {
      try {
        const category =
          await FileOrganizationService.createCategory(categoryData);
        createdCategories.push(category);
        console.log(`   ✅ Categoría creada: ${category.name}`);
      } catch (error: any) {
        if (error.code === "P2002") {
          console.log(`   ⚠️  Categoría ya existe: ${categoryData.name}`);
        } else {
          console.log(
            `   ❌ Error creando categoría ${categoryData.name}:`,
            error.message,
          );
        }
      }
    }

    // Crear etiquetas de ejemplo
    const tags = [
      {
        name: "Urgente",
        description: "Requiere atención inmediata",
        color: "#EF4444",
      },
      {
        name: "Revisar",
        description: "Necesita revisión",
        color: "#F59E0B",
      },
      {
        name: "Aprobado",
        description: "Documento aprobado",
        color: "#10B981",
      },
      {
        name: "Confidencial",
        description: "Información confidencial",
        color: "#8B5CF6",
      },
      {
        name: "Borrador",
        description: "Documento en borrador",
        color: "#6B7280",
      },
    ];

    console.log("\n🏷️  Creando etiquetas...");
    const createdTags = [];

    for (const tagData of tags) {
      try {
        const tag = await FileOrganizationService.createTag(tagData);
        createdTags.push(tag);
        console.log(`   ✅ Etiqueta creada: ${tag.name}`);
      } catch (error: any) {
        if (error.code === "P2002") {
          console.log(`   ⚠️  Etiqueta ya existe: ${tagData.name}`);
        } else {
          console.log(
            `   ❌ Error creando etiqueta ${tagData.name}:`,
            error.message,
          );
        }
      }
    }

    // Mostrar estadísticas
    console.log("\n📊 Estadísticas de organización:");
    try {
      const stats = await FileOrganizationService.getOrganizationStats();
      console.log(`   Total de archivos: ${stats.totalFiles}`);
      console.log(`   Archivos categorizados: ${stats.categorizedFiles}`);
      console.log(`   Archivos etiquetados: ${stats.taggedFiles}`);
      console.log(`   Categorías: ${stats.categoryCount}`);
      console.log(`   Etiquetas: ${stats.tagCount}`);
    } catch (error) {
      console.log("   ⚠️  No se pudieron obtener estadísticas:", error);
    }

    console.log("\n🎉 Datos de demostración creados exitosamente!");
    console.log("\n📋 Resumen:");
    console.log(`   Categorías creadas: ${createdCategories.length}`);
    console.log(`   Etiquetas creadas: ${createdTags.length}`);

    if (createdCategories.length > 0) {
      console.log("\n📁 Categorías disponibles:");
      createdCategories.forEach((cat) => {
        console.log(`   - ${cat.icon} ${cat.name} (${cat.color})`);
      });
    }

    if (createdTags.length > 0) {
      console.log("\n🏷️  Etiquetas disponibles:");
      createdTags.forEach((tag) => {
        console.log(`   - ${tag.name} (${tag.color})`);
      });
    }
  } catch (error) {
    console.error("❌ Error creando datos de demostración:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  createDemoData();
}

export default createDemoData;
