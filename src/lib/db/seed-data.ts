export const seedData = {
  users: [
    {
      firstName: "Gordon",
      lastName: "Freeman",
      email: "gordon.freeman@blackmesa.com",
      password: "Crowbar123",
    },
    {
      firstName: "Lara",
      lastName: "Croft",
      email: "lara.croft@tombraider.com",
      password: "DualPistols123",
    },
    {
      firstName: "John",
      lastName: "Shepard",
      email: "master@chief.com",
      password: "Calibrations123",
    },
    {
      firstName: "Geralt",
      lastName: "Rivia",
      email: "geralt@witcher.com",
      password: "SilverSword123",
    },
    {
      firstName: "Link",
      lastName: "Hyrule",
      email: "link@hyrule.com",
      password: "MasterSword123",
    },
    {
      firstName: "Maelle",
      lastName: "Dessendre",
      email: "maelle@dessendre.ft",
      password: "Expedition33",
    },
    {
      firstName: "Nathan",
      lastName: "Drake",
      email: "nathan@uncharted.com",
      password: "Fortune123",
    },
    {
      firstName: "Aloy",
      lastName: "Sobeck",
      email: "aloy@horizon.com",
      password: "MachineHunter123",
    },
    {
      firstName: "Crash",
      lastName: "Bandicoot",
      email: "crash@warped.com",
      password: "SpinAttack123",
    },
    {
      firstName: "Solid",
      lastName: "Snake",
      email: "david@foxhound.com",
      password: "MetalGear123",
    },
  ],
  organizations: [
    {
      name: "Aperture Science",
      slug: "aperture-science",
      description:
        "Aperture Science is a cutting-edge research corporation specializing in advanced technology and scientific experimentation, with a focus on portal technology, artificial intelligence, and human testing",
      address: "123 Science Way",
      postCode: "12345",
      country: "Netherlands",
      phone: "+31 20 123 4567",
      owner: "Gordon",
      users: ["Lara", "John", "Geralt", "Link", "Maelle"],
      teams: [
        {
          name: "Research and Development",
          description:
            "Creation and improvement of portal technology, including the development of new portal devices and applications.",
          users: ["Gordon", "Lara", "John", "Geralt", "Link", "Maelle"],
        },
        {
          name: "GLaDOS Operations",
          description:
            "Management and maintenance of the GLaDOS artificial intelligence system, including overseeing its operations and ensuring its functionality.",
          users: ["Lara", "Geralt"],
        },
        {
          name: "Human Resources",
          description:
            "Recruitment, training, and management of test subjects for various scientific experiments conducted by Aperture Science.",
          users: ["Gordon", "Lara", "John", "Maelle"],
        },
      ],
    },
    {
      name: "Vault-Tec Corporation",
      slug: "vault-tec-corporation",
      description:
        "Vault-Tec Corporation is a preeminent company in the field of underground shelter construction and survival technology. Established in the early 21st century, Vault-Tec is renowned for its extensive network of vaults designed to protect humanity from various catastrophic events, including nuclear fallout and natural disasters.",
      website: "https://www.vault-tec.com",
      address: "456 Survival Blvd",
      postCode: "67890",
      country: "USA",
      phone: "+1 555 123 4567",
      owner: "Nathan",
      users: ["Lara", "John", "Aloy", "Crash", "Solid"],
      teams: [
        {
          name: "Social Science",
          desciption:
            "Sociological analysis of vault life, including human behavior, social dynamics, and community building.",
          users: ["Lara", "John", "Nathan", "Aloy", "Crash", "Solid"],
        },
        {
          name: "Vault Maintenance",
          description:
            "Upkeep and repair of vault infrastructure, including life support systems, security measures, and general maintenance tasks",
          users: ["Nathan", "Aloy", "Crash", "Solid"],
        },
        {
          name: "General Atomics",
          description:
            "Development and maintenance of advanced technology and weaponry used within the vaults.",
          users: ["Lara", "Crash", "Solid"],
        },
        {
          name: "Pip-Boy Customer Support",
          description:
            "Provides assistance and support to vault dwellers regarding the use and functionality of the Pip-Boy",
          users: ["Lara", "John"],
        },
      ],
    },
  ],
};
