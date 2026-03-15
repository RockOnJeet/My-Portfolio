/**
 * Large multiline code snippets used in the hero editor tabs.
 * Structured for both human readability and machine parsing.
 */

export const xmlCodeAbout = `<!--👋 About Me -->

<about>
  <developer>
    <name>Soumyajit Pattanaik</name>
    <alias>RockOnJeet</alias>
    <role>Embedded Systems Developer</role>
  </developer>

  <!-- 🧠 Core focus areas -->
  <specializations>
    <domain>Firmware Development</domain>
    <domain>Power Electronics</domain>
    <domain>Control Systems</domain>
    <domain>Robotics</domain>
  </specializations>

  <!-- 🛠 What I actually build -->
  <work>
    I build efficient hardware-software systems using Embedded C and Python,
    ranging from BLDC motor controllers and gate-driver hardware to robotics
    prototypes and experimental control algorithms.
  </work>

  <!-- 📊 Quick stats -->
  <stats>
    <years_experience>3+</years_experience>
    <projects_developed>10+</projects_developed>
    <users_reached>2000+</users_reached>
    <passion_for_engineering>100%</passion_for_engineering>
  </stats>

  <!-- 🌍 Location -->
  <location>
    <region>Odisha</region>
    <country>India</country>
  </location>
</about>
`;

export const jsonCodeProjects = `/**
 * 🚀 Projects
 */

export const projects = [
  {
    name: "Omni-Bot",
    domain: "Autonomous Robotics",
    description:
      "A patented ground-based autonomous robot with holonomic drive capable of navigating narrow corridors and tight spaces.",
    technologies: ["ROS2", "Python", "C++", "Robotics"],
    stars: 128,
    repository: "https://github.com/RockOnJeet/Omni-Bot"
  },

  {
    name: "Diff_Drive",
    domain: "Robotics Research",
    description:
      "A robotics research project exploring differential drive locomotion and motion control.",
    technologies: ["ROS2", "Python", "C++"],
    stars: 87,
    repository: "https://github.com/VSSUT-Robotics-Society/Diff_Drive"
  },

  {
    name: "FOC Motor Controller",
    domain: "Motor Control Systems",
    description:
      "A MATLAB/Simulink model comparing Field-Oriented Control (FOC) with traditional motor control methods.",
    technologies: ["MATLAB", "Simulink", "Control Systems"],
    stars: 19,
    repository: "https://github.com/RockOnJeet/FOC_Simulink"
  },

  {
    name: "Packet Protocol",
    domain: "Embedded Communication",
    description:
      "A lightweight C++ library for synchronizing and verifying data sent over unreliable mediums like Serial UART.",
    technologies: ["C++", "Serial Communication", "Embedded Systems"],
    stars: 56,
    repository: "https://github.com/VSSUT-Robotics-Society/PacketProtocol"
  },

  {
    name: "Lappy",
    domain: "Experimental Systems",
    description:
      "A lightweight assistant operating system concept designed for low-resource hardware with API integrations.",
    technologies: ["Python", "System Design", "Embedded Interfaces"],
    stars: 33,
    repository: "https://github.com/RockOnJeet/Lappy"
  },

  {
    name: "Intro-ROS2",
    domain: "Education / Robotics",
    description:
      "A comprehensive beginner-friendly project guide to learning ROS2 through practical robotics examples.",
    technologies: ["ROS2", "Python", "C++"],
    stars: 210,
    repository: "https://github.com/VSSUT-Robotics-Society/Intro-ROS2"
  }
];
`;

export const pyCodeSkills = `# 🧠 Skills Overview

skills = {
    "languages": [
        "C/C++",
        "Python",
        "MATLAB / Simulink",
        "HTML / CSS / JS"
    ],

    # ⚡ Embedded hardware and electronics
    "embedded_hardware": [
        "Arduino ATMEL",
        "STM32",
        "Power Electronics",
        "Analog Systems"
    ],

    # 🔬 Modeling, debugging and simulation
    "development_simulation": [
        "Simulink",
        "Control System Modelling",
        "Firmware Debugging",
        "Hardware Bring-up"
    ],

    # 🧰 Tools I rely on while building systems
    "tools": [
        "Git",
        "Linux",
        "Oscilloscope",
        "Embedded Debugging",
        "3D Printing"
    ]
}

if __name__ == "__main__":
    # Pretty-print skills when run directly
    import pprint
    pprint.pprint(skills)
`;

export const cppCodeContact = `// 📬 Contact Information

#include <iostream>
#include <string>

struct Contact {
    std::string name = "Soumyajit Pattanaik";
    std::string alias = "RockOnJeet";

    // 📧 Email
    std::string email = "soumyajit2004jit@gmail.com";

    // 🌐 Social profiles
    std::string github =
        "https://github.com/RockOnJeet";

    std::string instagram =
        "https://www.instagram.com/soumyajit_pattanaik/";

    std::string linkedin =
        "https://www.linkedin.com/in/soumyajit-pattanaik";
};

int main() {
    Contact contact;

    std::cout << "Get in touch 👇" << std::endl;
    std::cout << "Email: " << contact.email << std::endl;
    std::cout << "GitHub: " << contact.github << std::endl;
    std::cout << "LinkedIn: " << contact.linkedin << std::endl;

    return 0;
}
`;