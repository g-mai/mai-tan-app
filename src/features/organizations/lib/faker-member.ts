import { faker } from "@faker-js/faker";

export type FakeMember = {
  firstName: string;
  lastName: string;
  email: string;
};

/** Generates a single fake teammate for the onboarding invite step. */
export function generateFakeMember(): FakeMember {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  // Unique provider subdomain keeps the address unique across repeat runs
  const email = faker.internet
    .email({
      firstName,
      lastName: `${lastName}-${faker.string.alphanumeric({ length: 6, casing: "lower" })}`,
      provider: `fake.member`,
    })
    .toLowerCase();

  return { firstName, lastName, email };
}
