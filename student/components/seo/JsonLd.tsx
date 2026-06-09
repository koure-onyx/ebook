'use client';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface TopicData {
  title: string;
  description: string;
  subject: string;
  grade: string;
  publishedAt: string;
  updatedAt: string;
  keywords: string[];
  thumbnail?: string;
  url: string;
  learningOutcomes?: string[];
  topics?: Array<{ title: string; url: string }>;
}

interface JsonLdProps {
  type?: 'LearningResource' | 'BreadcrumbList' | 'EducationalOrganization' | 'Course';
  data: TopicData | BreadcrumbItem[] | null;
}

export default function JsonLd({ type = 'LearningResource', data }: JsonLdProps) {
  let jsonLdObject: any = {};

  if (type === 'LearningResource' && data && typeof data !== 'object' || Array.isArray(data)) {
    const topicData = data as TopicData;
    jsonLdObject = {
      '@context': 'https://schema.org',
      '@type': 'LearningResource',
      name: topicData.title,
      description: topicData.description,
      about: topicData.subject,
      educationalLevel: topicData.grade,
      learningResourceType: 'Educational Website',
      audience: {
        '@type': 'EducationalAudience',
        educationalRole: 'student',
      },
      author: {
        '@type': 'Organization',
        name: 'StudyVault Pakistan',
        url: 'https://studyvault.pk',
      },
      publisher: {
        '@type': 'Organization',
        name: 'StudyVault Pakistan',
        logo: {
          '@type': 'ImageObject',
          url: 'https://studyvault.pk/logo.png',
        },
      },
      datePublished: topicData.publishedAt,
      dateModified: topicData.updatedAt,
      keywords: topicData.keywords.join(', '),
      thumbnailUrl: topicData.thumbnail || 'https://studyvault.pk/og-image.jpg',
      url: topicData.url,
      image: topicData.thumbnail || 'https://studyvault.pk/og-image.jpg',
      teaches: topicData.learningOutcomes?.join(', ') || topicData.description,
      hasPart: topicData.topics?.map((topic) => ({
        '@type': 'LearningResource',
        name: topic.title,
        url: topic.url,
      })),
      inLanguage: 'en-PK',
      typicalAgeRange: '14-16',
      interactivityType: 'active',
      accessibilityFeature: [
        'alternativeText',
        'displayTransformability',
        'readingOrder',
      ],
      isAccessibleForFree: true,
      materialExtent: 'Comprehensive',
    };
  } else if (type === 'BreadcrumbList' && Array.isArray(data)) {
    jsonLdObject = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: data.map((item: BreadcrumbItem, index: number) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    };
  } else if (type === 'EducationalOrganization') {
    jsonLdObject = {
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      name: 'StudyVault Pakistan',
      alternateName: 'StudyVault PK',
      description: "Pakistan's premier online learning platform for secondary education - FBISE, Punjab Board, and all major boards",
      url: 'https://studyvault.pk',
      logo: {
        '@type': 'ImageObject',
        url: 'https://studyvault.pk/logo.png',
        width: 200,
        height: 200,
      },
      foundingDate: '2024',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'PK',
        addressRegion: 'Punjab',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        email: 'info@studyvault.pk',
        availableLanguage: ['English', 'Urdu'],
      },
      sameAs: [
        'https://facebook.com/studyvaultpk',
        'https://twitter.com/studyvaultpk',
        'https://instagram.com/studyvaultpk',
        'https://youtube.com/@studyvaultpk',
      ],
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        reviewCount: '1250',
        bestRating: '5',
        worstRating: '1',
      },
    };
  } else if (type === 'Course') {
    jsonLdObject = {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: 'Grade 9 Physics - FBISE',
      description: 'Complete Grade 9 Physics course according to FBISE syllabus',
      provider: {
        '@type': 'Organization',
        name: 'StudyVault Pakistan',
        sameAs: 'https://studyvault.pk',
      },
      educationalCredentialAwarded: 'FBISE Secondary School Certificate',
      hasCourseInstance: {
        '@type': 'CourseInstance',
        courseMode: 'online',
        courseWorkload: 'PT30H',
        instructionalActivity: 'Full Course',
      },
      totalHistoricalEnrollment: '5000+',
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdObject) }}
    />
  );
}
