import {createClient} from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const client = createClient({
  projectId: '87sa1ng7',
  dataset: 'production',
  useCdn: true, // set to `false` to bypass the edge cache
  apiVersion: '2023-12-12', // use current date (YYYY-MM-DD) to target the latest API version
})

const builder = imageUrlBuilder(client)

export function urlFor(source) {
  return builder.image(source)
}

export async function getSEOSettings() {
  const content = await client.fetch(`*[_type == "seoSettings"]`)
  return content
}

export async function getHeaderContent() {
  const content = await client.fetch(`*[_type == "sectionHeader"]`)
  return content
}

const image = 'image{ crop, asset->{_id, metadata}, alt}'
const imageFields = 'crop, asset->{_id, metadata}, alt'

const sectionBlocks = (`
  ...,
  _type == "sectionHero" => {
    _type, eyebrow, heading, subheading, textAlignment, image, imageAlt, "videoURL": video.asset -> url, "imageURL": image.asset -> url, badgeText, buttonText, buttonURL, jumplink
  },
  _type == "sectionClients" => {
    _type, clients[]->{name, slug, image, logo, url}
  },
  _type == "sectionAbout" => {..., "videoURL": video.asset -> url, image},
  _type == "sectionServices" => {
    _type, heading, subheading, services[]
  },
  _type == "sectionContact" => {
    _type, heading, subheading, forms[]
  },
  _type == "sectionWork" => {
    _type, heading, subheading, categories[]->{name, slug}, projects[]->{title, slug, "clientName": client->name, "categories": categories[]->slug.current, thumbnailImage, showThumbnailVideo, "videoURL": thumbnailVideo.asset->url }
  },
  _type == "sectionPartners" => {
    _type, heading, subheading, inlineLogo, logos[]
  },
  _type == "sectionAgencies" => { _type, heading, agencies[]},
  _type == "sectionTextHero" => {...},
  _type == "sectionMediaFullbleed" => {...},
  _type == "sectionMediaGrid" => {...},
  _type == "sectionServiceDetail" => {..., "service": service->{ ...}},
  _type == "sectionTextColumns" => {...},
  _type == "sectionMediaGallery" => {..., media[]{..., "videoURL": video.asset->url, ${image} } },
  _type == "sectionContentBlocks" => {...,  blocks[]{..., "videoURL": video.asset->url, ${image} }  },
  _type == "sectionTextImage" => {..., ${image} },
  _type == "sectionSpeakers" => {..., speakers[]{..., image{${imageFields}}, companyLogo{${imageFields}} } },
`)

export async function getFooterContent() {
  const content = await client.fetch(`*[_type == "sectionFooter"]`)
  return content
}

export async function getHomePageContent() {
  const content = await client.fetch(`*[_type == "pageHome"]{..., content[]{${sectionBlocks}} }`)
  return content
}

export async function getPages() {
  const content = await client.fetch(`*[_type == "pageGeneral"]{..., content[]{${sectionBlocks}},}`)
  return content
}

export async function getBlogPageContent() {
  const pageContent = await client.fetch(`
    *[_type == "pageBlog"]{ ..., "featuredPost": featuredPost->{title, slug, excerpt, mainImage{${imageFields}}, "category": category->{name, slug}} }
  `)
  return pageContent[0]
}

export async function getBlogCategories() {
  const categories = await client.fetch(`*[_type == "categoryBlog"]`)
  return categories
}

const blogPostQuery = '..., category->{...}'

export async function getBlogPosts() {
  const postContent = await client.fetch(`
    *[_type == 'contentBlog']{..., mainImage{${imageFields}}, authors[]->{..., image{${imageFields}}}, category->{...}, categories[]->{...} } | order(publishedAt desc)
  `)
  return postContent
}

export async function getRelatedBlogPosts(project) {
  const relatedPosts = await client.fetch(`
    *[_type == 'contentBlog' && _id != '${project._id}' && category._ref == '${project.category._id}' ]{${blogPostQuery}}
  `)
  return relatedPosts
}

export async function getServicesPageContent() {
  const pageContent = await client.fetch(`*[_type == "pageServices"]{ ..., content[]{${sectionBlocks}}}`);
  return pageContent[0];
}

export async function getServiceDeliverables(service) {
  const deliverables = await client.fetch(`*[_type == "contentDeliverable" && category->service._ref == "${service}" ]{ ..., "category": category->name, "service": category->service->{name, slug}}`);
  return deliverables;
}



export async function getEvents() {
  const content = await client.fetch(`*[_type == "contentEvent"]{
    ...,
    content[]{
      ${sectionBlocks}
    },
  }`)
  return content
}



export async function getEventContent(slug) {
  const content = await client.fetch(`*[_type == "contentEvent" && slug.current == '${slug}']{
    title,
    slug,
    location,
    content[]{
      ${sectionBlocks}
    },
    metaTitle,
    metaDescription,
    metaImage, 
  }`)
  return content
}

export async function getServices() {
  const services = await client.fetch(`*[_type == "categoryService"]{...}`)
  return services
}

export async function getWorkPageContent() {
  const content = await client.fetch(`*[_type == "pageWork"]{...}`)
  return content[0]
}

export async function getProjectCategories() {
  const categories = await client.fetch(`*[_type == "categoryProject"]{...}`)
  return categories
}

export async function getProjectTags() {
  const tags = await client.fetch(`*[_type == "tagProject"]{...}`)
  return tags
}



export async function getProjects() {
  const projects = await client.fetch(`*[_type == "contentProject"]{..., "tags": tags[]->{name, slug}, mainImage{${imageFields}}, thumbnail{${imageFields}}, content[]{${sectionBlocks}} } | order(launchDate desc)`)
  return projects
}

export async function getRelatedProjects(project) {
  // console.log(project)
  const relatedProjects = await client.fetch(`*[_type == "contentProject" && category._ref == '${project.category._ref}' && slug.current != '${project.slug.current}' ]{..., thumbnail{${imageFields}} }`)
  const allOtherProjects = await client.fetch(`*[_type == "contentProject" && slug.current != '${project.slug.current}' ]{..., thumbnail{${imageFields}} }`)
  return { relatedProjects, allOtherProjects}
}

