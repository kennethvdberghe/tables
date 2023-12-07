import { http } from "msw";
import { setupWorker } from "msw/browser";
import { faker } from "@faker-js/faker";
faker.seed(1);

type Vehicle = {
  id: string;
  name: string;
  type: string;
  fuel: string;
};
const vehicles: Vehicle[] = faker.helpers.multiple(
  () => ({
    id: faker.string.uuid(),
    name: faker.vehicle.vehicle(),
    type: faker.vehicle.type(),
    fuel: faker.vehicle.fuel(),
  }),
  { count: 200 }
);

export const handlers = [
  http.get("/vehicles", ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page"));
    const sort = url.searchParams.get("sort");
    const desc = url.searchParams.get("sortDirection") === "desc";
    const sortKey = (sort || "id") as keyof Vehicle;
    vehicles.sort((a, b) => {
      const keyA = a[sortKey].toLowerCase();
      const keyB = b[sortKey].toLowerCase();
      if (keyA < keyB) {
        return desc ? 1 : -1;
      }
      return desc ? -1 : 1;
    });
    return Response.json({ data: vehicles.slice(page * 20, (page + 1) * 20) });
  }),
];

export const worker = setupWorker(...handlers);
