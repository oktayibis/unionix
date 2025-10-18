/**
 * Nested model example showing parent/child unions driven by a JSON payload.
 *
 * Run with: npx ts-node example/layout-model.ts
 */

import { create } from '../src';

interface MapMarker {
  readonly type: 'marker';
  readonly id: string;
  readonly label: string;
  readonly lat: number;
  readonly lng: number;
}

interface MapRegion {
  readonly type: 'region';
  readonly id: string;
  readonly coordinates: ReadonlyArray<readonly [number, number]>;
}

type MapChild = MapMarker | MapRegion;

interface MapSection {
  readonly type: 'map';
  readonly title: string;
  readonly theme: 'light' | 'dark';
  readonly children: ReadonlyArray<MapChild>;
}

interface GalleryImage {
  readonly type: 'image';
  readonly id: string;
  readonly src: string;
  readonly caption: string;
}

interface GalleryVideo {
  readonly type: 'video';
  readonly id: string;
  readonly src: string;
  readonly duration: number;
}

type GalleryChild = GalleryImage | GalleryVideo;

interface GallerySection {
  readonly type: 'gallery';
  readonly title: string;
  readonly layout: 'grid' | 'carousel';
  readonly children: ReadonlyArray<GalleryChild>;
}

interface StatCard {
  readonly type: 'statCard';
  readonly id: string;
  readonly metric: string;
  readonly value: number;
  readonly unit: string;
}

interface TrendLine {
  readonly type: 'trendLine';
  readonly id: string;
  readonly metric: string;
  readonly points: ReadonlyArray<number>;
}

type StatsChild = StatCard | TrendLine;

interface StatsSection {
  readonly type: 'stats';
  readonly title: string;
  readonly children: ReadonlyArray<StatsChild>;
}

type Section = MapSection | GallerySection | StatsSection;

interface ApiSuccess {
  readonly type: 'page';
  readonly slug: string;
  readonly sections: ReadonlyArray<Section>;
}

interface ApiEmpty {
  readonly type: 'empty';
  readonly reason: string;
}

interface ApiError {
  readonly type: 'error';
  readonly message: string;
}

type ApiModel = ApiSuccess | ApiEmpty | ApiError;

const apiModels = create<ApiModel>();
const sections = create<Section>();
const mapNodes = create<MapChild>();
const galleryNodes = create<GalleryChild>();
const statsNodes = create<StatsChild>();

const apiJson = `
{
  "type": "page",
  "slug": "interactive-dashboard",
  "sections": [
    {
      "type": "map",
      "title": "Global Offices",
      "theme": "light",
      "children": [
        { "type": "marker", "id": "london", "label": "London HQ", "lat": 51.5074, "lng": -0.1278 },
        { "type": "region", "id": "emea", "coordinates": [[48.8566, 2.3522], [41.9028, 12.4964], [52.52, 13.4050]] }
      ]
    },
    {
      "type": "gallery",
      "title": "Product Highlights",
      "layout": "carousel",
      "children": [
        { "type": "image", "id": "hero", "src": "/images/hero.jpg", "caption": "Hero banner" },
        { "type": "video", "id": "launch", "src": "/videos/launch.mp4", "duration": 42 }
      ]
    },
    {
      "type": "stats",
      "title": "Quarterly Metrics",
      "children": [
        { "type": "statCard", "id": "growth", "metric": "Growth", "value": 18, "unit": "%" },
        { "type": "trendLine", "id": "traffic", "metric": "Traffic", "points": [1200, 1500, 2100, 2600] }
      ]
    }
  ]
}
`;

const response = JSON.parse(apiJson) as ApiModel;

console.log('=== Interpreting API model ===');
const status = apiModels.match(response, {
  page: () => 'success',
  empty: () => 'empty',
  error: () => 'error',
});
console.log(`Payload status: ${status}`);

if (!apiModels.isPage(response)) {
  console.log('Nothing to render');
  process.exit(0);
}

const page = response;

console.log('\n=== Render tree ===');
page.sections.forEach((section, index) => {
  const representation = sections.when(section, {
    map: (mapSection) =>
      mapSection.children
        .map((child) =>
          mapNodes.when(child, {
            marker: (marker) => `Marker(${marker.label})`,
            region: (region) => `Region(${region.coordinates.length} points)`,
          })
        )
        .join(', '),
    gallery: (gallery) =>
      gallery.children
        .map((child) =>
          galleryNodes.when(child, {
            image: (image) => `Image(${image.caption})`,
            video: (video) => `Video(${video.duration}s)`,
          })
        )
        .join(', '),
    stats: (stats) =>
      stats.children
        .map((child) =>
          statsNodes.when(child, {
            statCard: (card) => `Stat(${card.metric}: ${card.value}${card.unit})`,
            trendLine: (trend) => `Trend(${trend.metric})`,
          })
        )
        .join(', '),
  });

  console.log(`#${index + 1} ${section.type}: ${representation}`);
});

console.log('\n=== Nested map transforms ===');
const normalizedSections = page.sections.map((section) =>
  sections.map(section, {
    map: (mapSection) => ({
      ...mapSection,
      children: mapSection.children.map((child) =>
        mapNodes.transform(child, {
          marker: (marker) => ({
            ...marker,
            label: marker.label.toUpperCase(),
          }),
          region: (region) => ({
            ...region,
            coordinates: region.coordinates.map(
              ([lat, lng]) => [Number(lat.toFixed(2)), Number(lng.toFixed(2))] as const
            ),
          }),
        })
      ),
    }),
    gallery: (gallery) => ({
      ...gallery,
      children: gallery.children.map((child) =>
        galleryNodes.map(child, {
          image: (image) => ({
            ...image,
            caption: `${image.caption} (retina)`,
          }),
        })
      ),
    }),
  })
);
console.log(normalizedSections);

console.log('\n=== UI component spec ===');
type ComponentSpec = {
  readonly component: string;
  readonly props: Record<string, unknown>;
  readonly children?: ReadonlyArray<ComponentSpec>;
};

const componentSpec: ComponentSpec[] = normalizedSections.map((section) =>
  sections.match(section, {
    map: (mapSection) => ({
      component: 'Map',
      props: { title: mapSection.title, theme: mapSection.theme },
      children: mapSection.children.map((child) =>
        mapNodes.match(child, {
          marker: (marker): ComponentSpec => ({
            component: 'Marker',
            props: { label: marker.label, position: [marker.lat, marker.lng] },
          }),
          region: (region): ComponentSpec => ({
            component: 'Region',
            props: { id: region.id, vertices: region.coordinates.length },
          }),
        })
      ),
    }),
    gallery: (gallery) => ({
      component: 'Gallery',
      props: { title: gallery.title, layout: gallery.layout },
      children: gallery.children.map((child) =>
        galleryNodes.match(child, {
          image: (image): ComponentSpec => ({
            component: 'Image',
            props: { src: image.src, caption: image.caption },
          }),
          video: (video): ComponentSpec => ({
            component: 'Video',
            props: { src: video.src, duration: video.duration },
          }),
        })
      ),
    }),
    stats: (stats) => ({
      component: 'Stats',
      props: { title: stats.title },
      children: stats.children.map((child) =>
        statsNodes.match(child, {
          statCard: (card): ComponentSpec => ({
            component: 'StatCard',
            props: { metric: card.metric, value: card.value, unit: card.unit },
          }),
          trendLine: (trend): ComponentSpec => ({
            component: 'TrendLine',
            props: { metric: trend.metric, points: trend.points },
          }),
        })
      ),
    }),
  })
);
console.log(JSON.stringify(componentSpec, null, 2));

console.log('\n=== Map markers ===');
const mapSections = sections.filter(normalizedSections, 'map');
const markers = mapSections.flatMap((mapSection) => mapNodes.filter(mapSection.children, 'marker'));
markers.forEach((marker) => {
  console.log(`Marker ${marker.id}: (${marker.lat}, ${marker.lng})`);
});

console.log('\n=== Enrich stats section ===');
const buildStatCard = statsNodes.constructor('statCard');
const enrichedSections = normalizedSections.map((section) =>
  sections.transform(section, {
    stats: (statsSection) => ({
      ...statsSection,
      children: [
        ...statsSection.children,
        buildStatCard({ id: 'visitors', metric: 'Visitors', value: 4823, unit: 'users' }),
      ],
    }),
  })
);
console.log(JSON.stringify(enrichedSections, null, 2));
