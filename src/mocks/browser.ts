import { http } from "msw";
import { setupWorker } from "msw/browser";
import { faker } from "@faker-js/faker";

const makeVehicles = (page: number) => {
  faker.seed(page);
  return faker.helpers.multiple(
    () => ({
      id: faker.string.uuid(),
      name: faker.vehicle.vehicle(),
      type: faker.vehicle.type(),
      fuel: faker.vehicle.fuel(),
    }),
    { count: 20 }
  );
};

export const handlers = [
  http.get("/vehicles", ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page"));
    return Response.json({ data: makeVehicles(page), page });
  }),
];

export const worker = setupWorker(...handlers);
