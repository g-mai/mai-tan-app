import { faker } from "@faker-js/faker";

const USERS_PER_ORG = 10;
const TEAMS_PER_ORG = 3;
const DEMO_PASSWORD = "DemoPass123!";

export type DemoUser = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type DemoTeam = {
  name: string;
  description: string;
  /** Indexes into the parent org's `users` array. */
  memberIndexes: number[];
};

export type DemoOrg = {
  name: string;
  slug: string;
  description: string;
  website: string;
  address: string;
  postCode: string;
  country: string;
  phone: string;
  users: DemoUser[];
  teams: DemoTeam[];
};

function generateUser(): DemoUser {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  // Unique provider subdomain keeps the address unique across repeat demo runs
  const email = faker.internet
    .email({
      firstName,
      lastName,
      provider: `${faker.string.alphanumeric({ length: 6, casing: "lower" })}.demo.local`,
    })
    .toLowerCase();

  return { firstName, lastName, email, password: DEMO_PASSWORD };
}

function generateOrg(): DemoOrg {
  const name = faker.company.name();
  const slug = `${faker.helpers.slugify(name).toLowerCase()}-${faker.string.alphanumeric(
    { length: 6, casing: "lower" },
  )}`;

  const users = Array.from({ length: USERS_PER_ORG }, generateUser);
  const userIndexes = users.map((_, i) => i);

  const teams = Array.from({ length: TEAMS_PER_ORG }, () => ({
    name: faker.commerce.department(),
    description: faker.company.catchPhrase(),
    memberIndexes: faker.helpers.arrayElements(userIndexes, {
      min: 2,
      max: USERS_PER_ORG,
    }),
  }));

  return {
    name,
    slug,
    description: faker.company.catchPhrase(),
    website: faker.internet.url(),
    address: faker.location.streetAddress(),
    postCode: faker.location.zipCode(),
    country: faker.location.country(),
    phone: faker.phone.number(),
    users,
    teams,
  };
}

/** Generates 2 organizations, each with 10 users and 3 teams, for the demo bootstrap. */
export function generateDemoData(): DemoOrg[] {
  return [generateOrg(), generateOrg()];
}
