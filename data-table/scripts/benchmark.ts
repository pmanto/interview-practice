// Compares the old DataTable pipeline against the optimized one, outside React.
// Run: npm run benchmark [-- <userCount>]
import { generateUsers } from "../src/data/generateUsers.ts";
import type { User } from "../src/types/User.ts";

const count = Number(process.argv[2] ?? 100_000);
const pageSize = 10;
const users = generateUsers(count);

function compare(sortProperty: keyof User, ascending: boolean) {
  const direction = ascending ? 1 : -1;
  return (a: User, b: User) => {
    if (a[sortProperty] < b[sortProperty]) return -direction;
    if (a[sortProperty] > b[sortProperty]) return direction;
    return 0;
  };
}

// Old: every state change (page, keystroke, sort) reran filter + sort + slice
function oldPipeline(filterBy: string, sortProperty: keyof User, page: number) {
  const filtered = filterBy === ""
    ? users
    : users.filter((user) => user.name.toLowerCase().includes(filterBy.toLowerCase()));
  return [...filtered].sort(compare(sortProperty, true)).slice((page - 1) * pageSize, page * pageSize);
}

// New: each stage is cached and only reruns when its own inputs change
function newPipeline() {
  const searchIndex = users.map((user) => ({ user, key: user.name.toLowerCase() }));
  let filtered = users;
  let sorted: User[] = [];
  return {
    filter(filterBy: string) {
      const query = filterBy.toLowerCase();
      filtered = query === "" ? users : searchIndex.filter((e) => e.key.includes(query)).map((e) => e.user);
    },
    sort(sortProperty: keyof User) {
      sorted = [...filtered].sort(compare(sortProperty, true));
    },
    page(page: number) {
      return sorted.slice((page - 1) * pageSize, page * pageSize);
    },
  };
}

function time(fn: () => void) {
  const start = performance.now();
  fn();
  return performance.now() - start;
}

const pageClicks = 20;
const typed = "alice";

// Warm up the JIT so the first measurement isn't skewed
oldPipeline("", "name", 1);

const oldResults = {
  "20 page clicks": time(() => {
    for (let p = 1; p <= pageClicks; p++) oldPipeline("", "name", p);
  }),
  'typing "alice"': time(() => {
    for (let i = 1; i <= typed.length; i++) oldPipeline(typed.slice(0, i), "name", 1);
  }),
  "1 sort change": time(() => oldPipeline("", "email", 1)),
};

let pipeline!: ReturnType<typeof newPipeline>;
const setup = time(() => {
  pipeline = newPipeline();
  pipeline.filter("");
  pipeline.sort("name");
});
const newResults = {
  "20 page clicks": time(() => {
    for (let p = 1; p <= pageClicks; p++) pipeline.page(p);
  }),
  'typing "alice"': time(() => {
    for (let i = 1; i <= typed.length; i++) {
      pipeline.filter(typed.slice(0, i));
      pipeline.sort("name");
      pipeline.page(1);
    }
  }),
  "1 sort change": time(() => {
    pipeline.filter("");
    pipeline.sort("email");
    pipeline.page(1);
  }),
};

console.log(`\n${count.toLocaleString()} users (one-time index + initial sort: ${setup.toFixed(1)} ms)\n`);
console.table(
  Object.keys(oldResults).map((scenario) => {
    const before = oldResults[scenario as keyof typeof oldResults];
    const after = newResults[scenario as keyof typeof newResults];
    return {
      scenario,
      "old (ms)": before.toFixed(1),
      "new (ms)": after.toFixed(2),
      speedup: `${(before / Math.max(after, 0.01)).toFixed(0)}x`,
    };
  })
);
