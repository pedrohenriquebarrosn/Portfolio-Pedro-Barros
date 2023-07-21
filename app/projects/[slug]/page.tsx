"use client";

import { ProjectDetails } from "@/app/components/pages/project/project-details";
import { ProjectSections } from "@/app/components/pages/project/project-sections";
import { ProjectPageData, ProjectsPageStaticData } from "@/app/types/page-info";
import { Project } from "@/app/types/projects";
import { fetchHygraphQuery } from "@/app/utils/fecth-hygraph-query";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";

type ProjectProps = {
  params: {
    slug: string;
  };
};

const getProjectDetails = async (slug: string): Promise<ProjectPageData> => {
  const query = `
  query ProjectQuery() {
    project(where: {slug: "${slug}"}) {
      pageThumbnail {
        url
      }
      thumbnail {
        url
      }
      sections {
        title
        image {
          url
        }
      }
      title
      shortDescription
      description {
        raw
        text
      }
      technologies {
        name
      }
      liveProjectUrl
      githubUrl
    }
  }
  `;
  const data = fetchHygraphQuery<ProjectPageData>(
    query,
    1000 * 60 * 60 * 24 // 1 day
  );

  return data;
};

export default async function Project({ params: { slug } }: ProjectProps) {
  const [project, setProject] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleProject = async () => {
      const { project } = await getProjectDetails(slug);
      setProject({
        title: project.title,
        description: {
          raw: project.description.raw,
          text: project.description.text,
        },
        openGraph: {
          images: [
            {
              url: project.thumbnail.url,
              width: 1200,
              height: 630,
            },
          ],
        },
      });
      setLoading(false);
    };
    handleProject();
  }, []);

  if (!project?.title) return notFound();

  return (
    <>
      {loading ? (
        <h1>carregando</h1>
      ) : (
        <>
          <ProjectDetails project={project} />
          <ProjectSections sections={project.sections} />
        </>
      )}
    </>
  );
}
