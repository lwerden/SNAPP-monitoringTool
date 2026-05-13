import { useState, useEffect, useRef } from "react";

const QUESTIONS = [
  {
    id: "goal",
    question: "What is your primary monitoring goal?",
    subtitle: "Different goals require different indicators and methods",
    options: [
      { label: "Carbon / biomass estimation", value: "carbon", icon: "🔬" },
      { label: "Biodiversity & species composition", value: "biodiversity", icon: "🦜" },
      { label: "Structural recovery & canopy dynamics", value: "structure", icon: "📐" },
      { label: "Survival & establishment", value: "survival", icon: "🌱" },
      { label: "Community & socioeconomic outcomes", value: "social", icon: "👥" },
      { label: "Project reporting & grants", value: "reporting", icon: "📊" },
    ],
  },
  {
    id: "scale",
    question: "What spatial scale are you monitoring?",
    subtitle: "This determines which remote sensing and field approaches are feasible",
    options: [
      { label: "Plots (<1 ha)", value: "plot", icon: "🌳" },
      { label: "Site / project (1–1,000 ha)", value: "site", icon: "🏞️" },
      { label: "Landscape (1,000–100,000 ha)", value: "landscape", icon: "🗺️" },
      { label: "Regional / national", value: "regional", icon: "🌍" },
    ],
  },
  {
    id: "ecosystem",
    question: "What ecosystem type?",
    subtitle: "Monitoring approaches vary significantly by context",
    options: [
      { label: "Tropical moist forest", value: "tropical_moist", icon: "🌴" },
      { label: "Tropical dry forest", value: "tropical_dry", icon: "🏜️" },
      { label: "Coastal", value: "coastal", icon: "🌊" },
    ],
  },
  {
    id: "budget",
    question: "What's your monitoring budget level?",
    subtitle: "Be honest — this shapes what's realistic",
    options: [
      { label: "Minimal (volunteer / community-based)", value: "low", icon: "💚" },
      { label: "Moderate (dedicated staff, basic equipment)", value: "medium", icon: "💰" },
      { label: "Well-funded (drones, sensors, paid imagery)", value: "high", icon: "🛰️" },
    ],
  },
  {
    id: "expertise",
    question: "What technical capacity is available?",
    subtitle: "Consider the skills of your team on the ground",
    options: [
      { label: "Community / non-specialist", value: "community", icon: "🤝" },
      { label: "Trained field technicians", value: "technician", icon: "📋" },
      { label: "GIS / remote sensing analysts", value: "gis", icon: "💻" },
      { label: "Research team with advanced tools", value: "research", icon: "🎓" },
    ],
  },
];

const RESOURCES = [
  {
    id: "drone_lidar",
    name: "Drone LiDAR Surveys",
    description: "High-resolution 3D canopy structure mapping using UAV-mounted LiDAR sensors. Enables individual tree detection, canopy height models, and biomass estimation.",
    tags: ["carbon", "structure"],
    scales: ["plot", "site"],
    budget: ["high"],
    expertise: ["gis", "research"],
    ecosystems: ["tropical_moist", "tropical_dry"],
    links: [
      { label: "lidR package", url: "https://r-lidar.github.io/lidR/" },
      { label: "PDAL pipeline tools", url: "https://pdal.io" },
    ],
    category: "Remote Sensing",
  },
  {
    id: "drone_rgb",
    name: "Drone RGB Photogrammetry",
    description: "Structure-from-motion processing of drone photos to create orthomosaics and point clouds. Lower cost than LiDAR but less accurate under canopy.",
    tags: ["structure", "survival", "carbon"],
    scales: ["plot", "site"],
    budget: ["medium", "high"],
    expertise: ["gis", "research"],
    ecosystems: ["tropical_moist", "tropical_dry", "coastal"],
    links: [
      { label: "OpenDroneMap", url: "https://www.opendronemap.org/" },
      { label: "WebODM", url: "https://www.opendronemap.org/webodm/" },
    ],
    category: "Remote Sensing",
  },
  {
    id: "satellite_free",
    name: "Free Satellite Imagery Analysis",
    description: "Landsat, Sentinel-2, and NICFI Planet basemaps for tracking canopy cover change, NDVI trends, and land use transitions at landscape scale.",
    tags: ["structure", "carbon"],
    scales: ["site", "landscape", "regional"],
    budget: ["low", "medium", "high"],
    expertise: ["gis", "research"],
    ecosystems: ["tropical_moist", "tropical_dry", "coastal"],
    links: [
      { label: "Google Earth Engine", url: "https://earthengine.google.com/" },
      { label: "SEPAL (FAO)", url: "https://sepal.io/" },
      { label: "NICFI Planet", url: "https://www.planet.com/nicfi/" },
    ],
    category: "Remote Sensing",
  },
  {
    id: "commercial_satellite",
    name: "High-Resolution Commercial Satellite",
    description: "Very high resolution (<1m) imagery from Planet SuperDove, Maxar, or Airbus for detailed canopy mapping without deploying drones.",
    tags: ["structure", "carbon", "survival"],
    scales: ["site", "landscape"],
    budget: ["high"],
    expertise: ["gis", "research"],
    ecosystems: ["tropical_moist", "tropical_dry", "coastal"],
    links: [
      { label: "Planet Explorer", url: "https://www.planet.com/explorer/" },
    ],
    category: "Remote Sensing",
  },
  {
    id: "field_plots",
    name: "Permanent Sample Plots",
    description: "Fixed plots with periodic census of tree DBH, height, species, and condition. Gold standard for calibration and ground-truthing remote sensing.",
    tags: ["carbon", "biodiversity", "structure", "survival"],
    scales: ["plot", "site"],
    budget: ["medium", "high"],
    expertise: ["technician", "research"],
    ecosystems: ["tropical_moist", "tropical_dry", "coastal"],
    links: [
      { label: "RAINFOR protocols", url: "https://rainfor.org/" },
      { label: "Open Foris", url: "https://openforis.org/" },
    ],
    category: "Field Methods",
  },
  {
    id: "community_monitoring",
    name: "Community-Based Monitoring",
    description: "Participatory approaches where local communities collect data using mobile apps, simple protocols, and visual indicators. Builds local ownership.",
    tags: ["survival", "social", "biodiversity"],
    scales: ["plot", "site"],
    budget: ["low", "medium"],
    expertise: ["community", "technician"],
    ecosystems: ["tropical_moist", "tropical_dry", "coastal"],
    links: [
      { label: "KoboToolbox", url: "https://www.kobotoolbox.org/" },
      { label: "ODK Collect", url: "https://getodk.org/" },
      { label: "Forest Watcher", url: "https://www.globalforestwatch.org/howto/forest-watcher/" },
    ],
    category: "Field Methods",
  },
  {
    id: "photo_monitoring",
    name: "Repeat Photography / PhotoMonitoring",
    description: "Fixed-point photos over time to visually document canopy closure, understory recovery, and landscape change. Simple but powerful for communication.",
    tags: ["structure", "survival", "social"],
    scales: ["plot", "site"],
    budget: ["low", "medium"],
    expertise: ["community", "technician"],
    ecosystems: ["tropical_moist", "tropical_dry", "coastal"],
    links: [
      { label: "Fotografit", url: "https://www.fotografit.eu/" },
    ],
    category: "Field Methods",
  },
  {
    id: "acoustic_monitoring",
    name: "Passive Acoustic Monitoring",
    description: "Deploy AudioMoth or similar recorders to track biodiversity recovery through soundscape analysis — bird, bat, insect, and amphibian communities.",
    tags: ["biodiversity"],
    scales: ["plot", "site"],
    budget: ["medium", "high"],
    expertise: ["technician", "research"],
    ecosystems: ["tropical_moist", "tropical_dry", "coastal"],
    links: [
      { label: "AudioMoth", url: "https://www.openacousticdevices.info/" },
      { label: "Arbimon", url: "https://arbimon.rfcx.org/" },
    ],
    category: "Biodiversity",
  },
  {
    id: "edna",
    name: "Environmental DNA (eDNA)",
    description: "Soil or water samples analyzed for biodiversity signatures. Emerging approach for detecting species presence without direct observation.",
    tags: ["biodiversity"],
    scales: ["plot", "site"],
    budget: ["high"],
    expertise: ["research"],
    ecosystems: ["tropical_moist", "tropical_dry", "coastal"],
    links: [
      { label: "eDNA Society", url: "https://ednasociety.org/" },
    ],
    category: "Biodiversity",
  },
  {
    id: "camera_traps",
    name: "Camera Traps for Wildlife",
    description: "Motion-triggered cameras for monitoring wildlife return to restored sites. AI-assisted species identification increasingly available.",
    tags: ["biodiversity"],
    scales: ["plot", "site"],
    budget: ["medium", "high"],
    expertise: ["technician", "research"],
    ecosystems: ["tropical_moist", "tropical_dry"],
    links: [
      { label: "Wildlife Insights", url: "https://www.wildlifeinsights.org/" },
      { label: "MegaDetector", url: "https://github.com/microsoft/CameraTraps" },
    ],
    category: "Biodiversity",
  },
  {
    id: "gfw_alerts",
    name: "Global Forest Watch Alerts",
    description: "Near-real-time deforestation and fire alerts for monitoring threats to restoration sites. Free and global coverage.",
    tags: ["structure", "survival"],
    scales: ["site", "landscape", "regional"],
    budget: ["low", "medium", "high"],
    expertise: ["community", "technician", "gis", "research"],
    ecosystems: ["tropical_moist", "tropical_dry", "coastal"],
    links: [
      { label: "Global Forest Watch", url: "https://www.globalforestwatch.org/" },
    ],
    category: "Platforms",
  },
  {
    id: "terramatch",
    name: "TerraMatch / TerraFund Monitoring",
    description: "WRI's platform for restoration project monitoring, reporting, and connecting projects to funding. Standardized metrics and dashboards.",
    tags: ["survival", "social", "carbon"],
    scales: ["site", "landscape"],
    budget: ["low", "medium"],
    expertise: ["community", "technician"],
    ecosystems: ["tropical_moist", "tropical_dry"],
    links: [
      { label: "TerraMatch", url: "https://www.terramatch.org/" },
    ],
    category: "Platforms",
  },
  {
    id: "allometric_carbon",
    name: "Allometric Biomass / Carbon Estimation",
    description: "Field measurements combined with species-specific or pantropical allometric equations for biomass and carbon stock estimation.",
    tags: ["carbon"],
    scales: ["plot", "site"],
    budget: ["medium", "high"],
    expertise: ["technician", "research"],
    ecosystems: ["tropical_moist", "tropical_dry", "coastal"],
    links: [
      { label: "GlobAllomeTree (FAO)", url: "http://www.globallometree.org/" },
      { label: "BIOMASS R package", url: "https://cran.r-project.org/package=BIOMASS" },
    ],
    category: "Carbon",
  },
  {
    id: "socioeconomic",
    name: "Socioeconomic Impact Surveys",
    description: "Household surveys, focus groups, and participatory mapping to assess livelihoods, land tenure, food security, and community well-being outcomes.",
    tags: ["social"],
    scales: ["plot", "site", "landscape"],
    budget: ["low", "medium", "high"],
    expertise: ["community", "technician", "research"],
    ecosystems: ["tropical_moist", "tropical_dry", "coastal"],
    links: [
      { label: "KoboToolbox", url: "https://www.kobotoolbox.org/" },
      { label: "SurveyCTO", url: "https://www.surveycto.com/" },
    ],
    category: "Social",
  },
  {
    id: "rmt_guide",
    name: "Restoration Monitoring Tools Guide",
    description: "Curated, searchable directory of restoration monitoring tools. Filter by ecosystem, indicator, scale, and cost to compare options across the landscape — a useful first stop when scoping which tools to investigate further.",
    tags: ["carbon", "biodiversity", "structure", "survival", "social"],
    scales: ["plot", "site", "landscape", "regional"],
    budget: ["low", "medium", "high"],
    expertise: ["technician", "gis", "research"],
    ecosystems: ["tropical_moist", "tropical_dry", "coastal"],
    links: [
      { label: "restorationmonitoringtools.org", url: "https://restorationmonitoringtools.org" },
    ],
    category: "Platforms",
  },
  {
    id: "open_foris",
    name: "Open Foris (FAO)",
    description: "FAO's suite of open-source tools for environmental monitoring, including Arena for data management, Calc for analysis, Collect Mobile for field data, and SEPAL for cloud-based satellite processing. Designed for national-scale forest inventories.",
    tags: ["carbon", "structure", "survival"],
    scales: ["plot", "site", "landscape", "regional"],
    budget: ["low", "medium", "high"],
    expertise: ["technician", "gis", "research"],
    ecosystems: ["tropical_moist", "tropical_dry", "coastal"],
    links: [
      { label: "openforis.org", url: "https://www.openforis.org" },
    ],
    category: "Platforms",
  },
  {
    id: "collect_earth",
    name: "Collect Earth / Collect Earth Online",
    description: "Augmented visual interpretation of satellite imagery for land use and land cover assessment. Free, built on Google Earth Engine, supports collaborative sampling-based monitoring across teams and large areas.",
    tags: ["structure", "carbon"],
    scales: ["site", "landscape", "regional"],
    budget: ["low", "medium"],
    expertise: ["technician", "gis", "research"],
    ecosystems: ["tropical_moist", "tropical_dry", "coastal"],
    links: [
      { label: "Collect Earth (FAO)", url: "https://www.openforis.org/tools/collect-earth" },
    ],
    category: "Remote Sensing",
  },
  {
    id: "giz_review",
    name: "GIZ / UN Decade Monitoring Tools Review",
    description: "Comprehensive review of monitoring tools and applications for ecosystem restoration, published under the UN Decade on Ecosystem Restoration. Reference document for understanding the tool landscape and selection criteria.",
    tags: ["carbon", "biodiversity", "structure", "survival", "social"],
    scales: ["plot", "site", "landscape", "regional"],
    budget: ["low", "medium", "high"],
    expertise: ["technician", "gis", "research"],
    ecosystems: ["tropical_moist", "tropical_dry", "coastal"],
    links: [
      { label: "UN Decade publication", url: "https://www.decadeonrestoration.org/publications/tools-and-applications-ecosystem-restoration-monitoring" },
    ],
    category: "Platforms",
  },
  {
    id: "treemapper",
    name: "Plant-for-the-Planet TreeMapper",
    description: "Mobile and web app for registering and visualizing tree planting sites. Supports both single-tree and area-based registrations with georeferenced photo documentation. Free for non-commercial use.",
    tags: ["survival", "structure"],
    scales: ["plot", "site"],
    budget: ["low", "medium"],
    expertise: ["community", "technician"],
    ecosystems: ["tropical_moist", "tropical_dry", "coastal"],
    links: [
      { label: "TreeMapper", url: "https://www.plant-for-the-planet.org/treemapper/" },
    ],
    category: "Field Methods",
  },
  {
    id: "regreening_africa",
    name: "Regreening Africa App",
    description: "Mobile app developed by ICRAF for tracking land restoration practices, tree planting, and farmer-managed natural regeneration across African drylands. Designed for community-led monitoring at scale.",
    tags: ["survival", "social", "structure"],
    scales: ["plot", "site", "landscape"],
    budget: ["low", "medium"],
    expertise: ["community", "technician"],
    ecosystems: ["tropical_dry"],
    links: [
      { label: "Regreening Africa app", url: "https://regreeningafrica.org/in-the-news/the-regreening-africa-app/" },
    ],
    category: "Field Methods",
  },
  {
    id: "instrumentl",
    name: "Instrumentl",
    description: "Grant discovery and management platform for nonprofits. Searchable database of foundation and government funding opportunities with deadline tracking, prospect research, and application workflow management.",
    tags: ["reporting"],
    scales: ["site", "landscape", "regional"],
    budget: ["medium", "high"],
    expertise: ["technician", "research"],
    ecosystems: ["tropical_moist", "tropical_dry", "coastal"],
    links: [
      { label: "instrumentl.com", url: "https://www.instrumentl.com" },
    ],
    category: "Grant Management",
  },
  {
    id: "liveimpact",
    name: "LiveImpact",
    description: "All-in-one nonprofit management platform covering grants, donors, programs, and impact reporting. Designed for small to mid-sized organizations managing multiple funding streams without enterprise complexity.",
    tags: ["reporting"],
    scales: ["site", "landscape", "regional"],
    budget: ["low", "medium"],
    expertise: ["technician", "research"],
    ecosystems: ["tropical_moist", "tropical_dry", "coastal"],
    links: [
      { label: "liveimpact.org", url: "https://www.liveimpact.org" },
    ],
    category: "Grant Management",
  },
  {
    id: "foundant",
    name: "Foundant GrantHub Pro",
    description: "Grant application and management software for grantseekers. Tracks proposals, deadlines, and reports across multiple funders. Note: scheduled for discontinuation in 2026 — existing users should plan migration to an alternative.",
    tags: ["reporting"],
    scales: ["site", "landscape", "regional"],
    budget: ["medium", "high"],
    expertise: ["technician", "research"],
    ecosystems: ["tropical_moist", "tropical_dry", "coastal"],
    links: [
      { label: "GrantHub Pro", url: "https://www.foundant.com/granthub" },
    ],
    category: "Grant Management",
  },
  {
    id: "salesforce_grants",
    name: "Salesforce Nonprofit Cloud for Grantmaking",
    description: "Enterprise grantmaking platform built on Salesforce. Best suited for larger organizations or foundations running structured grant programs with significant customization needs. Higher learning curve and cost than lighter alternatives.",
    tags: ["reporting"],
    scales: ["landscape", "regional"],
    budget: ["high"],
    expertise: ["technician", "research"],
    ecosystems: ["tropical_moist", "tropical_dry", "coastal"],
    links: [
      { label: "Nonprofit Cloud for Grantmaking", url: "https://www.salesforce.com/nonprofit/grantmaking-software" },
    ],
    category: "Grant Management",
  },
];

const ADVISORS = [
  {
    id: "cifor_icraf",
    name: "CIFOR-ICRAF",
    description: "Merged Center for International Forestry Research and World Agroforestry. Premier source of technical guidance on tropical forests, agroforestry systems, and restoration science. Strong field presence in Indonesia, Kenya, and Latin America.",
    offers: ["Technical guidance", "Field trial design", "Agroforestry"],
    regions: "Global tropics, with regional offices in Asia, Africa, Latin America",
    contact: { label: "cifor-icraf.org", url: "https://www.cifor-icraf.org/" },
    category: "Research Institutions",
  },
  {
    id: "ser",
    name: "Society for Ecological Restoration (SER)",
    description: "Sets the International Principles and Standards for the Practice of Ecological Restoration. Best starting point for grounding a project in widely accepted definitions, indicators, and the 5-star recovery wheel.",
    offers: ["Standards", "Principles", "Practitioner network"],
    regions: "Global with regional chapters",
    contact: { label: "ser.org", url: "https://www.ser.org/" },
    category: "Standards & Networks",
  },
  {
    id: "wri_gri",
    name: "WRI Global Restoration Initiative",
    description: "World Resources Institute's restoration arm. Runs TerraFund, TerraMatch, and the Restoration Policy Accelerator. Strong on monitoring frameworks, finance pipelines, and connecting projects to funders.",
    offers: ["Monitoring frameworks", "Finance matchmaking", "Policy"],
    regions: "Africa, Latin America, Asia",
    contact: { label: "wri.org/initiatives/global-restoration-initiative", url: "https://www.wri.org/initiatives/global-restoration-initiative" },
    category: "NGOs & Implementation",
  },
  {
    id: "iucn",
    name: "IUCN",
    description: "Convenes the Bonn Challenge and develops the Restoration Barometer for tracking national commitments. Useful for projects seeking alignment with international restoration pledges and IUCN Red List of Ecosystems guidance.",
    offers: ["National-level planning", "ROAM methodology", "Policy alignment"],
    regions: "Global",
    contact: { label: "iucn.org/our-work/forests", url: "https://iucn.org/our-work/forests" },
    category: "NGOs & Implementation",
  },
  {
    id: "snapp_more",
    name: "SNAPP — MoRE Working Group",
    description: "Science for Nature and People Partnership's Monitoring Restoration Effectiveness working group. Convenes practitioners and scientists to develop shared indicators and field-validated monitoring protocols.",
    offers: ["Indicator development", "Practitioner-scientist convening"],
    regions: "Global",
    contact: { label: "snappartnership.net", url: "https://snappartnership.net/" },
    category: "Standards & Networks",
  },
  {
    id: "fao_forestry",
    name: "FAO Forestry Division",
    description: "United Nations technical guidance, global forest assessments, and tools like Collect Earth, SEPAL, and Open Foris. Strong on national forest monitoring systems and large-scale assessments.",
    offers: ["Open-source tools", "National monitoring", "Technical manuals"],
    regions: "Global, with country offices",
    contact: { label: "fao.org/forestry", url: "https://www.fao.org/forestry/en/" },
    category: "Research Institutions",
  },
  {
    id: "alliance_bioversity",
    name: "Alliance of Bioversity International & CIAT",
    description: "Agrobiodiversity and climate-smart agriculture expertise. Strong on cocoa, coffee, and tropical crop systems — useful for agroforestry and restoration-with-production designs.",
    offers: ["Agrobiodiversity", "Climate-smart agriculture", "Tropical crops"],
    regions: "Global tropics",
    contact: { label: "alliancebioversityciat.org", url: "https://alliancebioversityciat.org/" },
    category: "Research Institutions",
  },
  {
    id: "tnc",
    name: "The Nature Conservancy",
    description: "Large-scale implementation partner with strong capacity in finance mechanisms, blended capital, and Indigenous and community-led conservation. Useful for projects looking to scale or unlock private investment.",
    offers: ["Implementation at scale", "Blended finance", "Land tenure"],
    regions: "Global",
    contact: { label: "nature.org", url: "https://www.nature.org/" },
    category: "NGOs & Implementation",
  },
  {
    id: "gpflr",
    name: "Global Partnership on Forest & Landscape Restoration",
    description: "Network of governments, organizations, and communities working on FLR. Hosts the Bonn Challenge tracking and connects practitioners to policy processes and regional learning exchanges.",
    offers: ["Peer networks", "Policy engagement", "Knowledge exchange"],
    regions: "Global",
    contact: { label: "forestlandscaperestoration.org", url: "https://forestlandscaperestoration.org/" },
    category: "Standards & Networks",
  },
  {
    id: "rainforest_alliance",
    name: "Rainforest Alliance",
    description: "Certification, supply chain, and producer support — particularly strong for coffee, cocoa, and forestry. Useful when restoration outcomes need to link to commodity sourcing or premium markets.",
    offers: ["Certification", "Supply chain", "Smallholder support"],
    regions: "Global tropics",
    contact: { label: "rainforest-alliance.org", url: "https://www.rainforest-alliance.org/" },
    category: "NGOs & Implementation",
  },
];

const ADVISOR_CATEGORY_COLORS = {
  "Research Institutions": { bg: "#1a2a3a", border: "#2d4a6b", text: "#7faacc" },
  "NGOs & Implementation": { bg: "#1a3a2a", border: "#2d6b4a", text: "#7fccab" },
  "Standards & Networks": { bg: "#2a1a2a", border: "#6b2d5a", text: "#cc7fbb" },
};

function scoreResource(resource, answers) {
  let score = 0;
  let maxScore = 0;

  if (answers.scale) {
    maxScore += 3;
    if (resource.scales.includes(answers.scale)) score += 3;
  }
  if (answers.goal) {
    maxScore += 4;
    if (resource.tags.includes(answers.goal)) score += 4;
  }
  if (answers.budget) {
    maxScore += 2;
    if (resource.budget.includes(answers.budget)) score += 2;
  }
  if (answers.expertise) {
    maxScore += 2;
    if (resource.expertise.includes(answers.expertise)) score += 2;
  }
  if (answers.ecosystem) {
    maxScore += 1;
    if (resource.ecosystems.includes(answers.ecosystem)) score += 1;
  }

  return maxScore > 0 ? score / maxScore : 0;
}

const CATEGORY_COLORS = {
  "Remote Sensing": { bg: "#1a3a2a", border: "#2d6b4a", text: "#7fccab" },
  "Field Methods": { bg: "#2a2a1a", border: "#6b5f2d", text: "#ccb87f" },
  Biodiversity: { bg: "#1a2a3a", border: "#2d4a6b", text: "#7faacc" },
  Platforms: { bg: "#2a1a2a", border: "#6b2d5a", text: "#cc7fbb" },
  Carbon: { bg: "#1a2a2a", border: "#2d6b6b", text: "#7fcccc" },
  Social: { bg: "#2a1a1a", border: "#6b3a2d", text: "#cc8f7f" },
  "Grant Management": { bg: "#1f1a2a", border: "#4a3d6b", text: "#a89fcc" },
};

function ResourceCard({ resource, score }) {
  const colors = CATEGORY_COLORS[resource.category] || CATEGORY_COLORS["Field Methods"];
  const pct = Math.round(score * 100);

  return (
    <div
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: 12,
        padding: "20px 24px",
        marginBottom: 12,
        transition: "all 0.2s ease",
        opacity: pct < 40 ? 0.5 : 1,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div>
          <span
            style={{
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: colors.text,
              fontFamily: "'DM Mono', monospace",
            }}
          >
            {resource.category}
          </span>
          <h3
            style={{
              margin: "4px 0 0",
              fontSize: 18,
              fontFamily: "'Fraunces', serif",
              color: "#e8e4dc",
              fontWeight: 500,
            }}
          >
            {resource.name}
          </h3>
        </div>
        <div
          style={{
            background: pct >= 80 ? "#2d6b4a" : pct >= 60 ? "#5a6b2d" : "#4a3a2d",
            borderRadius: 20,
            padding: "4px 12px",
            fontSize: 13,
            fontFamily: "'DM Mono', monospace",
            color: "#e8e4dc",
            whiteSpace: "nowrap",
            marginLeft: 12,
          }}
        >
          {pct}% match
        </div>
      </div>
      <p
        style={{
          fontSize: 14,
          lineHeight: 1.6,
          color: "#a8a49c",
          margin: "8px 0 12px",
          fontFamily: "'Source Sans 3', sans-serif",
        }}
      >
        {resource.description}
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {resource.links.map((link, i) => (
          <a
            key={i}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 12,
              color: colors.text,
              textDecoration: "none",
              border: `1px solid ${colors.border}`,
              borderRadius: 6,
              padding: "4px 10px",
              fontFamily: "'DM Mono', monospace",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = colors.border;
              e.target.style.color = "#e8e4dc";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "transparent";
              e.target.style.color = colors.text;
            }}
          >
            {link.label} ↗
          </a>
        ))}
      </div>
    </div>
  );
}

function AdvisorCard({ advisor }) {
  const colors = ADVISOR_CATEGORY_COLORS[advisor.category] || ADVISOR_CATEGORY_COLORS["Research Institutions"];

  return (
    <div
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: 12,
        padding: "20px 24px",
        marginBottom: 12,
        transition: "all 0.2s ease",
      }}
    >
      <span
        style={{
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: colors.text,
          fontFamily: "'DM Mono', monospace",
        }}
      >
        {advisor.category}
      </span>
      <h3
        style={{
          margin: "4px 0 0",
          fontSize: 18,
          fontFamily: "'Fraunces', serif",
          color: "#e8e4dc",
          fontWeight: 500,
        }}
      >
        {advisor.name}
      </h3>
      <p
        style={{
          fontSize: 14,
          lineHeight: 1.6,
          color: "#a8a49c",
          margin: "8px 0 12px",
          fontFamily: "'Source Sans 3', sans-serif",
        }}
      >
        {advisor.description}
      </p>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        {advisor.offers.map((o, i) => (
          <span
            key={i}
            style={{
              fontSize: 11,
              fontFamily: "'DM Mono', monospace",
              color: colors.text,
              background: "rgba(0,0,0,0.2)",
              border: `1px solid ${colors.border}`,
              borderRadius: 4,
              padding: "2px 8px",
            }}
          >
            {o}
          </span>
        ))}
      </div>
      <div
        style={{
          fontSize: 12,
          fontFamily: "'DM Mono', monospace",
          color: "#6a6660",
          marginBottom: 10,
        }}
      >
        Coverage: {advisor.regions}
      </div>
      <a
        href={advisor.contact.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          fontSize: 12,
          color: colors.text,
          textDecoration: "none",
          border: `1px solid ${colors.border}`,
          borderRadius: 6,
          padding: "4px 10px",
          fontFamily: "'DM Mono', monospace",
          transition: "all 0.15s ease",
          display: "inline-block",
        }}
        onMouseEnter={(e) => {
          e.target.style.background = colors.border;
          e.target.style.color = "#e8e4dc";
        }}
        onMouseLeave={(e) => {
          e.target.style.background = "transparent";
          e.target.style.color = colors.text;
        }}
      >
        {advisor.contact.label} ↗
      </a>
    </div>
  );
}

export default function MonitoringWizard() {
  const [mode, setMode] = useState("landing"); // landing, wizard, search, results, advisors, share
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [advisorFilter, setAdvisorFilter] = useState("All");
  const [fadeIn, setFadeIn] = useState(true);
  const [shareForm, setShareForm] = useState({ name: "", ecosystem: "", tools: "", recommendations: "", contact: "" });
  const [shareSubmitted, setShareSubmitted] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setFadeIn(false);
    const t = setTimeout(() => setFadeIn(true), 30);
    return () => clearTimeout(t);
  }, [currentStep, mode]);

  const handleAnswer = (questionId, value) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
    if (currentStep < QUESTIONS.length - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 200);
    } else {
      setTimeout(() => setMode("results"), 300);
    }
  };

  const getResults = () => {
    return RESOURCES.map((r) => ({
      resource: r,
      score: scoreResource(r, answers),
    }))
      .filter((r) => r.score > 0.3)
      .sort((a, b) => b.score - a.score);
  };

  const getSearchResults = () => {
    const q = searchQuery.toLowerCase();
    if (!q) return RESOURCES.map((r) => ({ resource: r, score: 1 }));
    return RESOURCES.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.tags.some((t) => t.includes(q))
    ).map((r) => ({ resource: r, score: 1 }));
  };

  const getFilteredAdvisors = () => {
    if (advisorFilter === "All") return ADVISORS;
    return ADVISORS.filter((a) => a.category === advisorFilter);
  };

  const reset = () => {
    setAnswers({});
    setCurrentStep(0);
    setAdvisorFilter("All");
    setSearchQuery("");
    setShareForm({ name: "", ecosystem: "", tools: "", recommendations: "", contact: "" });
    setShareSubmitted(false);
    setMode("landing");
  };

  const currentQuestion = QUESTIONS[currentStep];
  const advisorCategories = ["All", ...new Set(ADVISORS.map((a) => a.category))];

  return (
    <div
      ref={containerRef}
      style={{
        minHeight: "100vh",
        background: "#0f0f0e",
        color: "#e8e4dc",
        fontFamily: "'Source Sans 3', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle grid background */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(232,228,220,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(232,228,220,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          pointerEvents: "none",
        }}
      />

      {/* Header */}
      <header
        style={{
          padding: "24px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid rgba(232,228,220,0.08)",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div
          onClick={reset}
          style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "linear-gradient(135deg, #2d6b4a, #1a3a2a)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
            }}
          >
            🌲
          </div>
          <span
            style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 18,
              fontWeight: 400,
              letterSpacing: "-0.01em",
            }}
          >
            Forest Monitoring Finder
          </span>
        </div>
        {mode !== "landing" && (
          <button
            onClick={reset}
            style={{
              background: "none",
              border: "1px solid rgba(232,228,220,0.15)",
              color: "#a8a49c",
              padding: "6px 16px",
              borderRadius: 6,
              cursor: "pointer",
              fontFamily: "'DM Mono', monospace",
              fontSize: 12,
            }}
          >
            Start over
          </button>
        )}
      </header>

      {/* Landing */}
      {mode === "landing" && (
        <div
          style={{
            maxWidth: 720,
            margin: "0 auto",
            padding: "100px 40px",
            textAlign: "center",
            opacity: fadeIn ? 1 : 0,
            transform: fadeIn ? "translateY(0)" : "translateY(12px)",
            transition: "all 0.5s ease",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 24 }}>🌲</div>
          <h1
            style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 42,
              fontWeight: 300,
              lineHeight: 1.2,
              marginBottom: 16,
              letterSpacing: "-0.02em",
            }}
          >
            Find the right monitoring approach for your restoration project
          </h1>
          <p
            style={{
              fontSize: 17,
              color: "#a8a49c",
              lineHeight: 1.7,
              marginBottom: 48,
              maxWidth: 480,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Get tailored tool recommendations, browse the database directly, or find an advisory organization to consult.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 12,
              maxWidth: 640,
              margin: "0 auto",
            }}
          >
            <button
              onClick={() => setMode("wizard")}
              style={{
                background: "#2d6b4a",
                color: "#e8e4dc",
                border: "none",
                padding: "20px 24px",
                borderRadius: 10,
                fontSize: 15,
                fontFamily: "'Source Sans 3', sans-serif",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
                textAlign: "left",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#3a8a60")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#2d6b4a")}
            >
              <div style={{ fontSize: 20, marginBottom: 6 }}>🧭</div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Guide me →</div>
              <div style={{ fontSize: 13, fontWeight: 400, opacity: 0.85 }}>
                Answer 5 questions to get tailored tool recommendations
              </div>
            </button>
            <button
              onClick={() => setMode("search")}
              style={{
                background: "transparent",
                color: "#e8e4dc",
                border: "1px solid rgba(232,228,220,0.2)",
                padding: "20px 24px",
                borderRadius: 10,
                fontSize: 15,
                fontFamily: "'Source Sans 3', sans-serif",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
                textAlign: "left",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(232,228,220,0.5)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(232,228,220,0.2)")}
            >
              <div style={{ fontSize: 20, marginBottom: 6 }}>🔎</div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Search tools</div>
              <div style={{ fontSize: 13, fontWeight: 400, color: "#a8a49c" }}>
                Browse the full database of monitoring tools and methods
              </div>
            </button>
            <button
              onClick={() => setMode("advisors")}
              style={{
                background: "transparent",
                color: "#e8e4dc",
                border: "1px solid rgba(232,228,220,0.2)",
                padding: "20px 24px",
                borderRadius: 10,
                fontSize: 15,
                fontFamily: "'Source Sans 3', sans-serif",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
                textAlign: "left",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(232,228,220,0.5)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(232,228,220,0.2)")}
            >
              <div style={{ fontSize: 20, marginBottom: 6 }}>🤝</div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>I want advice</div>
              <div style={{ fontSize: 13, fontWeight: 400, color: "#a8a49c" }}>
                Find advisory organizations like CIFOR-ICRAF, WRI, and SER
              </div>
            </button>
            <button
              onClick={() => setMode("share")}
              style={{
                background: "transparent",
                color: "#e8e4dc",
                border: "1px solid rgba(232,228,220,0.2)",
                padding: "20px 24px",
                borderRadius: 10,
                fontSize: 15,
                fontFamily: "'Source Sans 3', sans-serif",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
                textAlign: "left",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(232,228,220,0.5)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(232,228,220,0.2)")}
            >
              <div style={{ fontSize: 20, marginBottom: 6 }}>💬</div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>I have experience to share</div>
              <div style={{ fontSize: 13, fontWeight: 400, color: "#a8a49c" }}>
                Tell us what tools and methods have worked for your project
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Wizard */}
      {mode === "wizard" && currentQuestion && (
        <div
          style={{
            maxWidth: 640,
            margin: "0 auto",
            padding: "60px 40px",
            opacity: fadeIn ? 1 : 0,
            transform: fadeIn ? "translateY(0)" : "translateY(12px)",
            transition: "all 0.4s ease",
          }}
        >
          {/* Progress */}
          <div style={{ display: "flex", gap: 6, marginBottom: 48 }}>
            {QUESTIONS.map((_, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: 3,
                  borderRadius: 2,
                  background: i <= currentStep ? "#2d6b4a" : "rgba(232,228,220,0.1)",
                  transition: "background 0.3s ease",
                }}
              />
            ))}
          </div>

          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 12,
              color: "#6a6660",
              marginBottom: 12,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            Question {currentStep + 1} of {QUESTIONS.length}
          </div>

          <h2
            style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 32,
              fontWeight: 400,
              lineHeight: 1.3,
              marginBottom: 8,
              letterSpacing: "-0.01em",
            }}
          >
            {currentQuestion.question}
          </h2>
          <p style={{ color: "#6a6660", fontSize: 15, marginBottom: 36, lineHeight: 1.5 }}>
            {currentQuestion.subtitle}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {currentQuestion.options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleAnswer(currentQuestion.id, opt.value)}
                style={{
                  background:
                    answers[currentQuestion.id] === opt.value
                      ? "rgba(45,107,74,0.3)"
                      : "rgba(232,228,220,0.04)",
                  border:
                    answers[currentQuestion.id] === opt.value
                      ? "1px solid #2d6b4a"
                      : "1px solid rgba(232,228,220,0.08)",
                  color: "#e8e4dc",
                  padding: "16px 20px",
                  borderRadius: 10,
                  fontSize: 15,
                  fontFamily: "'Source Sans 3', sans-serif",
                  cursor: "pointer",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  if (answers[currentQuestion.id] !== opt.value) {
                    e.currentTarget.style.background = "rgba(232,228,220,0.08)";
                    e.currentTarget.style.borderColor = "rgba(232,228,220,0.15)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (answers[currentQuestion.id] !== opt.value) {
                    e.currentTarget.style.background = "rgba(232,228,220,0.04)";
                    e.currentTarget.style.borderColor = "rgba(232,228,220,0.08)";
                  }
                }}
              >
                <span style={{ fontSize: 22 }}>{opt.icon}</span>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>

          {currentStep > 0 && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              style={{
                background: "none",
                border: "none",
                color: "#6a6660",
                marginTop: 24,
                cursor: "pointer",
                fontFamily: "'DM Mono', monospace",
                fontSize: 13,
              }}
            >
              ← Back
            </button>
          )}
        </div>
      )}

      {/* Results */}
      {mode === "results" && (
        <div
          style={{
            maxWidth: 700,
            margin: "0 auto",
            padding: "60px 40px 120px",
            opacity: fadeIn ? 1 : 0,
            transform: fadeIn ? "translateY(0)" : "translateY(12px)",
            transition: "all 0.5s ease",
          }}
        >
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 12,
              color: "#2d6b4a",
              marginBottom: 12,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            Recommended approaches
          </div>
          <h2
            style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 32,
              fontWeight: 400,
              marginBottom: 8,
              letterSpacing: "-0.01em",
            }}
          >
            Here's what fits your project
          </h2>
          <p style={{ color: "#6a6660", fontSize: 15, marginBottom: 12, lineHeight: 1.5 }}>
            Based on your answers, ranked by relevance. Tools with less than 40% match are dimmed.
          </p>

          {/* Answer summary pills */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 32 }}>
            {Object.entries(answers).map(([key, val]) => {
              const q = QUESTIONS.find((q) => q.id === key);
              const opt = q?.options.find((o) => o.value === val);
              return (
                <span
                  key={key}
                  style={{
                    fontSize: 12,
                    fontFamily: "'DM Mono', monospace",
                    color: "#a8a49c",
                    background: "rgba(232,228,220,0.06)",
                    border: "1px solid rgba(232,228,220,0.08)",
                    borderRadius: 20,
                    padding: "4px 12px",
                  }}
                >
                  {opt?.icon} {opt?.label}
                </span>
              );
            })}
          </div>

          {getResults().map(({ resource, score }) => (
            <ResourceCard key={resource.id} resource={resource} score={score} />
          ))}

          <div style={{ marginTop: 32, textAlign: "center", display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => setMode("search")}
              style={{
                background: "none",
                border: "1px solid rgba(232,228,220,0.15)",
                color: "#a8a49c",
                padding: "10px 24px",
                borderRadius: 8,
                cursor: "pointer",
                fontFamily: "'Source Sans 3', sans-serif",
                fontSize: 14,
              }}
            >
              Browse all tools →
            </button>
            <button
              onClick={() => setMode("advisors")}
              style={{
                background: "none",
                border: "1px solid rgba(232,228,220,0.15)",
                color: "#a8a49c",
                padding: "10px 24px",
                borderRadius: 8,
                cursor: "pointer",
                fontFamily: "'Source Sans 3', sans-serif",
                fontSize: 14,
              }}
            >
              Find an advisor →
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      {mode === "search" && (
        <div
          style={{
            maxWidth: 700,
            margin: "0 auto",
            padding: "60px 40px 120px",
            opacity: fadeIn ? 1 : 0,
            transform: fadeIn ? "translateY(0)" : "translateY(12px)",
            transition: "all 0.5s ease",
          }}
        >
          <h2
            style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 32,
              fontWeight: 400,
              marginBottom: 24,
              letterSpacing: "-0.01em",
            }}
          >
            Search monitoring tools
          </h2>
          <input
            type="text"
            placeholder="e.g. drone, biodiversity, carbon, community..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            style={{
              width: "100%",
              background: "rgba(232,228,220,0.04)",
              border: "1px solid rgba(232,228,220,0.12)",
              color: "#e8e4dc",
              padding: "14px 20px",
              borderRadius: 10,
              fontSize: 16,
              fontFamily: "'Source Sans 3', sans-serif",
              marginBottom: 32,
              outline: "none",
              boxSizing: "border-box",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#2d6b4a")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(232,228,220,0.12)")}
          />

          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 12,
              color: "#6a6660",
              marginBottom: 16,
            }}
          >
            {getSearchResults().length} tool{getSearchResults().length !== 1 ? "s" : ""}
            {searchQuery ? ` matching "${searchQuery}"` : ""}
          </div>

          {getSearchResults().map(({ resource, score }) => (
            <ResourceCard key={resource.id} resource={resource} score={score} />
          ))}
        </div>
      )}

      {/* Advisors */}
      {mode === "advisors" && (
        <div
          style={{
            maxWidth: 700,
            margin: "0 auto",
            padding: "60px 40px 120px",
            opacity: fadeIn ? 1 : 0,
            transform: fadeIn ? "translateY(0)" : "translateY(12px)",
            transition: "all 0.5s ease",
          }}
        >
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 12,
              color: "#2d6b4a",
              marginBottom: 12,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            Advisory organizations
          </div>
          <h2
            style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 32,
              fontWeight: 400,
              marginBottom: 8,
              letterSpacing: "-0.01em",
            }}
          >
            Who to talk to
          </h2>
          <p style={{ color: "#6a6660", fontSize: 15, marginBottom: 28, lineHeight: 1.5 }}>
            Tools and methods only get you so far. These organizations offer technical guidance,
            field experience, peer networks, and pathways to funding — choose based on the kind of
            help you're looking for.
          </p>

          {/* Category filter pills */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
            {advisorCategories.map((cat) => {
              const active = advisorFilter === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setAdvisorFilter(cat)}
                  style={{
                    background: active ? "rgba(45,107,74,0.3)" : "rgba(232,228,220,0.04)",
                    border: active ? "1px solid #2d6b4a" : "1px solid rgba(232,228,220,0.08)",
                    color: active ? "#e8e4dc" : "#a8a49c",
                    padding: "6px 14px",
                    borderRadius: 20,
                    fontSize: 13,
                    fontFamily: "'DM Mono', monospace",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {getFilteredAdvisors().map((advisor) => (
            <AdvisorCard key={advisor.id} advisor={advisor} />
          ))}

          <div
            style={{
              marginTop: 32,
              padding: 20,
              background: "rgba(232,228,220,0.03)",
              border: "1px dashed rgba(232,228,220,0.12)",
              borderRadius: 10,
              fontSize: 13,
              color: "#a8a49c",
              lineHeight: 1.6,
            }}
          >
            <strong style={{ color: "#e8e4dc", fontFamily: "'Fraunces', serif", fontWeight: 500 }}>
              A note on choosing advisors:
            </strong>{" "}
            Most of these organizations are responsive to direct outreach when the ask is specific.
            Mention your project context, what you've already considered, and what kind of input would
            be most useful — short, well-scoped requests get answered. Regional offices (e.g. CIFOR-ICRAF
            Bogor for Indonesia, Nairobi for East Africa) are often more responsive than headquarters.
          </div>
        </div>
      )}

      {/* Share Experience */}
      {mode === "share" && (
        <div
          style={{
            maxWidth: 640,
            margin: "0 auto",
            padding: "60px 40px 120px",
            opacity: fadeIn ? 1 : 0,
            transform: fadeIn ? "translateY(0)" : "translateY(12px)",
            transition: "all 0.5s ease",
          }}
        >
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 12,
              color: "#2d6b4a",
              marginBottom: 12,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            Share your experience
          </div>
          <h2
            style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 32,
              fontWeight: 400,
              marginBottom: 8,
              letterSpacing: "-0.01em",
            }}
          >
            What's worked for you?
          </h2>
          <p style={{ color: "#6a6660", fontSize: 15, marginBottom: 36, lineHeight: 1.5 }}>
            Help other practitioners by sharing what monitoring tools and methods have worked in your
            context — and what you'd recommend.
          </p>

          {shareSubmitted ? (
            <div
              style={{
                background: "rgba(45,107,74,0.15)",
                border: "1px solid #2d6b4a",
                borderRadius: 12,
                padding: "32px 28px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 16 }}>✓</div>
              <h3
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontSize: 22,
                  fontWeight: 400,
                  marginBottom: 8,
                }}
              >
                Thank you for sharing
              </h3>
              <p style={{ color: "#a8a49c", fontSize: 14, lineHeight: 1.6 }}>
                Your experience helps build a better resource for the restoration community.
              </p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setShareSubmitted(true);
              }}
              style={{ display: "flex", flexDirection: "column", gap: 20 }}
            >
              {[
                { key: "name", label: "Name / organization", type: "input" },
                { key: "ecosystem", label: "Ecosystem type & region", type: "input", placeholder: "e.g. Tropical moist forest, East Kalimantan" },
                { key: "tools", label: "Tools or methods you've used", type: "textarea", placeholder: "e.g. Drone RGB photogrammetry with OpenDroneMap, permanent sample plots, KoboToolbox for field data..." },
                { key: "recommendations", label: "What would you recommend to others?", type: "textarea", placeholder: "What worked well? What would you do differently? Any tips for someone starting out?" },
                { key: "contact", label: "Contact info (optional)", type: "input", placeholder: "Email or website — in case we'd like to follow up" },
              ].map((field) => (
                <div key={field.key}>
                  <label
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontFamily: "'DM Mono', monospace",
                      color: "#a8a49c",
                      marginBottom: 8,
                    }}
                  >
                    {field.label}
                  </label>
                  {field.type === "input" ? (
                    <input
                      type="text"
                      value={shareForm[field.key]}
                      onChange={(e) => setShareForm({ ...shareForm, [field.key]: e.target.value })}
                      placeholder={field.placeholder || ""}
                      required={field.key !== "contact"}
                      style={{
                        width: "100%",
                        background: "rgba(232,228,220,0.04)",
                        border: "1px solid rgba(232,228,220,0.12)",
                        color: "#e8e4dc",
                        padding: "12px 16px",
                        borderRadius: 8,
                        fontSize: 15,
                        fontFamily: "'Source Sans 3', sans-serif",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#2d6b4a")}
                      onBlur={(e) => (e.target.style.borderColor = "rgba(232,228,220,0.12)")}
                    />
                  ) : (
                    <textarea
                      value={shareForm[field.key]}
                      onChange={(e) => setShareForm({ ...shareForm, [field.key]: e.target.value })}
                      placeholder={field.placeholder || ""}
                      required
                      rows={4}
                      style={{
                        width: "100%",
                        background: "rgba(232,228,220,0.04)",
                        border: "1px solid rgba(232,228,220,0.12)",
                        color: "#e8e4dc",
                        padding: "12px 16px",
                        borderRadius: 8,
                        fontSize: 15,
                        fontFamily: "'Source Sans 3', sans-serif",
                        outline: "none",
                        boxSizing: "border-box",
                        resize: "vertical",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#2d6b4a")}
                      onBlur={(e) => (e.target.style.borderColor = "rgba(232,228,220,0.12)")}
                    />
                  )}
                </div>
              ))}
              <button
                type="submit"
                style={{
                  background: "#2d6b4a",
                  color: "#e8e4dc",
                  border: "none",
                  padding: "14px 28px",
                  borderRadius: 8,
                  fontSize: 15,
                  fontFamily: "'Source Sans 3', sans-serif",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  alignSelf: "flex-start",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#3a8a60")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#2d6b4a")}
              >
                Submit
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
