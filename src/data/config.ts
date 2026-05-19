/**
 * ============================================================
 * PORTFOLIO CONFIGURATION
 * Edit the values below to personalize every section.
 * ============================================================
 */

import { xmlCodeAbout, jsonCodeProjects, pyCodeSkills, cppCodeContact } from "./codeSnippets";

export const nav = {
  /** Your name shown in the top-left logo area */
  name: "RockOnJeet!",

  /** Navigation links shown in the header */
  links: [
    { label: "About", href: "#about" },
    { label: "Projects", href: "#projects" },
    { label: "Skills", href: "#skills" },
    { label: "Contact", href: "#contact" },
  ],

  /** Other nav links shown in the header dropdown */
  others: [
    { label: "TARDIS - A time capsule", href: "/time-capsule", external: false },
  ],

  /** The primary CTA button in the nav */
  cta: { label: "Hire me", href: "#contact" },
};

export const hero = {
  /** Large headline — make it bold and personal */
  headline: "I'm\nnot a\nWebDev.",

  /**
   * Optional alternate headlines shown randomly on page load.
   *
   * You can wrap any word in `{}` to render it in a muted/secondary style.
   * Example: "I'm\n{not} a\nWebDev." will dim the word "not".
   *
   * Weight controls likelihood: higher weight = more likely to show.
   */
  headlineVariants: [
    { text: "I'm\n{not} a\nWebDev.", weight: 110 },
    { text: "Try\n{refreshing}\nthe page.", weight: 75 },
    { text: "I\n{love}\nProgramming.", weight: 100 },
    { text: "I\n{can} write\npoetry too.", weight: 25 },
    { text: "I\n{read} them\ndocs.", weight: 100 },
    { text: "{GeeksForGeeks}\nis my\nTeacher.", weight: 75 },
    { text: "Was it\n{really} worth\nit?", weight: 3 },
    { text: "I\n{don't} do\nFull-Stack.", weight: 100 },
    { text: "You\n{really} like\ncode, huh?", weight: 25 },
    { text: "I\n{build}\ncool stuff.", weight: 100 },
    { text: "I\n{code} in\nmy sleep.", weight: 25 },
    { text: "How many\nF5's did\nyou do?", weight: 5 },
    { text: "{None} of this\nwas made\nby me.", weight: 50 },
    { text: "This\nis {not} a\n404 page.", weight: 25 },
    { text: "Top\ncoder in\n{hiding}.", weight: 15 },
    { text: "I\n{don't} know what\nI'm doing.", weight: 25 },
    { text: "You just {keep}\nrefreshing\ndon't you?", weight: 50 },
    { text: "I\n{write} code\nlike this.", weight: 100 },
    { text: "I\n{really} should\nget a job.", weight: 50 },
    { text: "Yes, I\n{use} GitHub\nCopilot.", weight: 10 },
    { text: "You\n{found} the\nEaster Egg!", weight: 5 },
    { text: "You\n{shouldn't} be\nreading this.", weight: 25 },
    { text: "Don't\n{ask} about\nLeetCode.", weight: 75 },
    { text: "I\n{really} should\nget a job.", weight: 50 },
    { text: "I\n{promise} I'm\nnot a bot.", weight: 25 },
    { text: "No one's\ngonna believe\nyou.", weight: 5 },
    { text: "I\n{swear} I'm\na human.", weight: 25 },
    { text: "My prompts,\n {AI}'s code.", weight: 50 },
    { text: "I {hope}\nyou like\nrobots.", weight: 25 },
    { text: "Tell me\n{about}\nthis.", weight: 1 },
    { text: "Not\n{your} typical\nportfolio.", weight: 25 },
    { text: "I\n{bet} you can't\nread all\nthese.", weight: 50 },
    { text: "You just\n{lost} the\ngame.", weight: 5 },
    { text: "Hey, I'm\n{looking} for a\njob!", weight: 75 },
    { text: "{Hey,}\nyou're awake.\n(I hope so)", weight: 25 },
    { text: "Wait, you\n{can} read this?", weight: 25 },
    { text: "I\n{play}\nMinecraft too.", weight: 10 },
    { text: "Never gonna\n{give} you up,\nnever gonna\nlet you down.", weight: 5 },
    { text: "I'm\na {CEO} of\nbad jokes.", weight: 25 },
    { text: "I'm\non\n{GitHub}.", weight: 100 },
    { text: "I {love}\nopen-source\nsoftware.", weight: 75 },
    { text: "I {have}\na LinkedIn\ntoo.", weight: 75 },
    { text: "Say that\n{five} times fast.", weight: 10 },
    { text: "Endless\n{variants} of\nheadlines.", weight: 90 },
    { text: "Ending the\nheadline list\nsoon...", weight: 25 },
  ],

  /** One or two sentences below the headline */
  subline:
    "*The website was created by GitHub Copilot (Vibe coding go brr).\nI'm a developer who loves optimizing and improving cost-effectiveness of any existing product. Let's turn your new tech idea into [highly optimized products] capable of running anywhere.",

  /** Primary CTA button */
  primaryCta: { label: "See my work", href: "#projects" },

  /** Secondary CTA button */
  secondaryCta: { label: "Get in touch", href: "#contact" },

  /**
   * Code editor tabs shown between the hero and about sections.
   * Add / remove entries here to control which tabs are shown.
   */
  editorTabs: [
    {
      id: "about",
      label: "about.xml",
      content: xmlCodeAbout,
    },
    {
      id: "projects",
      label: "projects.json",
      content: jsonCodeProjects,
    },
    {
      id: "skills",
      label: "skills.py",
      content: pyCodeSkills,
    },
    {
      id: "contact",
      label: "contact.cpp",
      content: cppCodeContact,
    }
  ],
};

export const about = {
  /** Short bio paragraph */
  bio: "I'm an embedded systems developer focused on firmware, power electronics, and control systems. I work primarily with Embedded C and Python to build efficient hardware - software systems, from BLDC motor controllers and gate-driver hardware to robotics prototypes and experimental control algorithms.",

  /** Fun facts / quick stats */
  stats: [
    { value: "3+", label: "Years of experience" },
    { value: "10+", label: "Projects developed" },
    { value: "2k+", label: "Users reached" },
    { value: "100%", label: "Passion for craft" },
  ],

  /** Your location */
  location: "Odisha, India",

  /** Your email address */
  email: "c291bXlhMjAwNGppdEBnbWFpbC5jb20=", // base64 encoded (you@example.com)

  /** Social links — leave empty to hide */
  socials: {
    github: "aHR0cHM6Ly9naXRodWIuY29tL1JvY2tPbkplZXQv", // base64 encoded (https://github.com/yourusername)
    instagram: "aHR0cHM6Ly93d3cuaW5zdGFncmFtLmNvbS9zb3VteWFqaXRfcGF0dGFuYWlrLw==", // base64 encoded (https://instagram.com/yourusername)
    linkedin: "aHR0cHM6Ly93d3cubGlua2VkaW4uY29tL2luL3NvdW15YWppdC1wYXR0YW5haWs=", // base64 encoded (https://linkedin.com/in/yourusername)
  },
};

export const projects = [
  {
    name: "Omni-Bot",
    description:
      "A patented ground-based autonomous robot with holonomic drive, capable of navigating narrow corridors and tight spaces.",
    language: "ROS2 / Python / C++",
    languageColor: "#00c8ff",
    stars: 128,
    url: "https://github.com/RockOnJeet/Omni-Bot",
    liveUrl: "", // Optional: Add live URL
  },
  {
    name: "Diff_Drive",
    description:
      "A college based research on robotics employing differential drive.",
    language: "ROS2 / Python / C++",
    languageColor: "#00a437",
    stars: 87,
    url: "https://github.com/VSSUT-Robotics-Society/Diff_Drive",
    liveUrl: "",
  },
  {
    name: "FOC Motor Controller",
    description:
      "A MATLAB/Simulink based model comparing field-oriented control with traditional control methods.",
    language: "MATLAB / Simulink",
    languageColor: "#8b5cf6",
    stars: 19,
    url: "https://github.com/RockOnJeet/FOC_Simulink",
    liveUrl: "",
  },
  {
    name: "Packet Protocol",
    description:
      "A library for syncing & verifying data sent over unreliable physical mediums like SerialUART.",
    language: "C++",
    languageColor: "#f1e05a",
    stars: 56,
    url: "https://github.com/VSSUT-Robotics-Society/PacketProtocol",
    liveUrl: "",
  },
  {
    name: "Lappy",
    description:
      "An attempt to build a small-screen assistant OS, capable of integrating with various APIs and running on low-resource hardware.",
    language: "Python",
    languageColor: "#dea584",
    stars: 33,
    url: "https://github.com/RockOnJeet/Lappy",
    liveUrl: "",
  },
  {
    name: "Intro-ROS2",
    description:
      "A comprehensive simple project based guide on learning ROS2.",
    language: "ROS2 / Python / C++",
    languageColor: "#a0048e",
    stars: 210,
    url: "https://github.com/VSSUT-Robotics-Society/Intro-ROS2",
    liveUrl: "",
  },
];

export const skills = [
  {
    category: "Languages",
    items: ["C/C++", "Python", "MATLAB / Simulink", "HTML / CSS / JS"],
  },
  {
    category: "Embedded & Hardware",
    items: ["Arduino ATMEL", "STM32", "Power Electronics", "Analog Systems"],
  },
  {
    category: "Development & Simulation",
    items: ["Simulink", "Control System Modelling", "Firmware Debugging", "Hardware Bring-up"],
  },
  {
    category: "Tools",
    items: ["Git", "Linux", "Oscilloscope & Embedded Debugging", "3D Printing"],
  },
];

/**
 * Google Forms configuration for the feedback widget.
 *
 * - `formId` is the ID found in the form’s URL: https://docs.google.com/forms/d/e/<formId>/viewform
 * - `entryIds` are the `entry.*` parameter names from the prefill link.
 *
 * If you leave `formId` blank, the feedback widget will be disabled.
 */
export const feedbackForm = {
  formId: "1FAIpQLScZJdX8WApKRrfZskhTi6tHdhHpBMnoxcQdiTVElfdmnI1_BQ",
  entryIds: {
    displayName: "entry.126889621",
    message: "entry.1097650747",
  },
};
