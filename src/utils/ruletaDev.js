// Local-only test harness for the wheel. Loaded from Ruleta.astro behind
// `import.meta.env.DEV`, so it never ships in production builds.
//
//   ruletaDev.enter();                       // open the wheel without a backend
//   ruletaDev.spin(1, { duration: 2 });      // force slot 1 to win
//   ruletaDev.checkAll();                    // pointer/slot alignment for the 6 slots
//
// See `help()` for the whole surface.
import { gsap } from "gsap";
import { userStore } from "@/store/userStore";
import gift from "@/assets/images/ruleta/prize-bonos.webp";
import vales from "@/assets/images/ruleta/prize-vales.webp";
import combo1 from "@/assets/images/ruleta/prize-combo1.webp";
import combo2 from "@/assets/images/ruleta/prize-combo2.webp";
import equipos from "@/assets/images/ruleta/prize-equipos.webp";

const svg = (w, h, color) =>
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" rx="${Math.min(w, h) / 6}" fill="${color}"/></svg>`,
  );

// Local placeholders must be absolute: resolveAssetUrl would otherwise treat the
// root-relative dev-server path as an API path and request it from the API host.
const abs = (asset) => new URL(asset.src, window.location.origin).href;

const norm360 = (deg) => ((deg % 360) + 360) % 360;
const diff180 = (a, b) => ((a - b + 540) % 360) - 180;

// --- fixtures (shape of GET /Provinces/:id/allowed-prize-types) ---------------
const sub = (id, name, imagen, hasStock = true) => ({
  id,
  name,
  description: name.toLowerCase(),
  imagen,
  hasStock,
  displayOrder: 0,
  isActive: true,
});
const type = (prizeTypeId, prizeTypeName, imageUrl, hasStock = true, subtypes = null) => ({
  prizeTypeId,
  prizeTypeName,
  imageUrl,
  isAllowed: true,
  hasStock,
  subtypes,
});

const base = (img = {}) => [
  type(10, "Bonos", img.bonos ?? abs(gift)),
  type(11, "Equipos y accesorios", img.equipos ?? abs(equipos)),
  type(12, "Combos", img.combos ?? abs(combo1), true, [
    sub(8, "Combo 1", img.combo1 ?? abs(combo1)),
    sub(9, "Combo 2", img.combo2 ?? abs(combo2)),
  ]),
  type(13, "Vales", img.vales ?? abs(vales)),
];

const SLOT_KEYS = ["bonos", "vales", "equipos", "combo1", "combo2"];

const setStock = (products, keys) => {
  const off = new Set(keys);
  return products.map((p) => {
    const copy = { ...p };
    if (p.prizeTypeName === "Bonos" && off.has("bonos")) copy.hasStock = false;
    if (p.prizeTypeName === "Vales" && off.has("vales")) copy.hasStock = false;
    if (p.prizeTypeName === "Equipos y accesorios" && off.has("equipos")) copy.hasStock = false;
    if (p.prizeTypeName === "Combos") {
      copy.subtypes = p.subtypes.map((s) => ({
        ...s,
        hasStock: !(
          (s.name === "Combo 1" && off.has("combo1")) ||
          (s.name === "Combo 2" && off.has("combo2"))
        ),
      }));
      copy.hasStock = copy.subtypes.some((s) => s.hasStock);
    }
    return copy;
  });
};

const fixtures = {
  default: () => base(),
  noStock: (keys = []) => setStock(base(), keys),
  allNoStock: () => setStock(base(), SLOT_KEYS),
  noCombos: () => base().filter((p) => p.prizeTypeName !== "Combos"),
  // Relative `imagen` paths like the real API returns today (host comes from `imageUrl`).
  relativeImages: () =>
    base({
      combos: "https://crm.dev-limprod.com/uploads/prize-types/combos.png",
      combo1: "/uploads/prize-subtypes/subtype-8.png",
      combo2: "/uploads/prize-subtypes/subtype-9.png",
    }),
  // Wildly different aspect ratios + one broken URL: all must stay inside their slot.
  odd: () =>
    base({
      bonos: svg(400, 100, "#e8a96f"),
      vales: svg(100, 400, "#2b6cb0"),
      equipos: svg(16, 16, "#2f855a"),
      combo1: "https://invalid.invalid/broken.png",
      combo2: svg(600, 200, "#805ad5"),
    }),
  // First `n` prize types only (0..4).
  count: (n) => base().slice(0, n),
};

// --- install ---------------------------------------------------------------
export function install(ctx) {
  const { deps, ruletaTable, targetAngle, girarRuleta, resetRuleta, resetSpinState } = ctx;
  const items = Array.from(ctx.items);
  const original = { ...deps };
  const total = items.length;
  let lastTarget = null;
  let debugEl = null;

  const baseUser = {
    id: "dev-user",
    email: "dev@example.com",
    fullName: "Dev User",
    docType: "DNI",
    docNumber: "00000000",
    serviceId: "dev-service",
    provinceId: "dev-province",
    product: "Movil",
    fullClaro: true,
    detallePlay: "300",
    verified: true,
  };

  const currentRotation = () => norm360(Number(gsap.getProperty(ruletaTable, "rotation")) || 0);

  // Angle of the slot centre on screen, 0 = straight up (where the pointer is).
  const onScreenAngle = (item) => {
    const wheel = ruletaTable.getBoundingClientRect();
    const cx = wheel.left + wheel.width / 2;
    const cy = wheel.top + wheel.height / 2;
    const ref = item.querySelector("[data-prize-img]") ?? item;
    const r = ref.getBoundingClientRect();
    const dx = r.left + r.width / 2 - cx;
    const dy = r.top + r.height / 2 - cy;
    return norm360((Math.atan2(dx, -dy) * 180) / Math.PI);
  };

  const api = {
    deps,
    fixtures,

    help() {
      return [
        "enter({products, user, canSpin})",
        "spin(i, {result: 'WIN'|'NO_STOCK'|'ERROR', duration})",
        "rotateTo(i) / check(i) / checkAll()",
        "fixtures.{default,noStock([keys]),allNoStock,noCombos,relativeImages,odd,count(n)}",
        "debug(on) / reset()",
      ].join("\n");
    },

    enter({ products, user, canSpin = true } = {}) {
      deps.validUserEnabled = async () => ({
        canSpin,
        remainingPlays: canSpin ? 1 : 0,
        reason: "Simulated by ruletaDev (canSpin=false)",
      });
      deps.getListProducts = async () => ({
        success: true,
        data: products ?? fixtures.default(),
      });
      userStore.setState({ user: { ...baseUser, ...user } });
      document.dispatchEvent(new CustomEvent("ruleta:enter"));
    },

    spin(index, { result = "WIN", duration = 2 } = {}) {
      const item = items[index];
      if (!item) return console.warn(`[ruletaDev] no slot ${index}`);
      const stock = Number(item.getAttribute("data-stock") || 0);
      if (stock <= 0) {
        console.warn(
          `[ruletaDev] slot ${index} has no stock (or no category): the real picker will skip it.`,
        );
      }
      lastTarget = index;
      deps.pickIndex = (available) =>
        available.some((a) => a.index === index)
          ? index
          : (console.warn(`[ruletaDev] slot ${index} not available, picking ${available[0].index}`),
            (lastTarget = available[0].index));
      deps.spinDuration = duration;
      deps.spinSaveResult = async (serviceId, prizeTypeId) => {
        if (result === "ERROR") {
          const err = new Error("Simulated server error");
          err.apiMessage = "Simulated server error";
          throw err;
        }
        if (result === "NO_STOCK") {
          return { success: false, result: "NO_STOCK", message: "Simulated: no stock for this prize" };
        }
        return {
          success: true,
          result: "WIN",
          prizeId: "dev-prize",
          prizeName: `Premio de prueba (categoria ${prizeTypeId})`,
          prizeImageUrl: items[index].querySelector("[data-prize-img]")?.src ?? abs(gift),
          prizeTypeId,
          message: "Simulated win",
        };
      };
      resetSpinState();
      return girarRuleta();
    },

    rotateTo(index) {
      lastTarget = index;
      gsap.killTweensOf(ruletaTable, "rotation");
      gsap.set(ruletaTable, { rotation: targetAngle(index, total) });
      return currentRotation();
    },

    check(index = lastTarget) {
      const actualDeg = currentRotation();
      const expected = index == null ? null : targetAngle(index, total);
      const screen = items.map((it) => onScreenAngle(it));
      const under = screen.reduce(
        (best, a, i) => (Math.abs(diff180(a, 0)) < Math.abs(diff180(screen[best], 0)) ? i : best),
        0,
      );
      const err = expected == null ? null : diff180(actualDeg, expected);
      return {
        expected,
        actualDeg: Number(actualDeg.toFixed(2)),
        errorDeg: err == null ? null : Number(err.toFixed(2)),
        slotUnderPointer: under,
        ok: expected != null && Math.abs(err) <= 1.5 && under === index,
      };
    },

    checkAll() {
      const rows = items.map((_, i) => {
        api.rotateTo(i);
        return { slot: i, ...api.check(i) };
      });
      console.table(rows);
      return rows.every((r) => r.ok);
    },

    debug(on = true) {
      debugEl?.remove();
      debugEl = null;
      if (!on) return;
      const stage = ruletaTable.closest(".ruleta-stage");
      debugEl = document.createElement("div");
      debugEl.style.cssText = "position:absolute;inset:0;z-index:30;pointer-events:none";
      const ring = (r, color) =>
        `<div style="position:absolute;border:1px solid ${color};border-radius:50%;left:calc(var(--cx) - ${r});top:calc(var(--cy) - ${r});width:calc(${r} * 2);height:calc(${r} * 2)"></div>`;
      const axes = Array.from(
        { length: total },
        (_, i) =>
          `<div style="position:absolute;left:var(--cx);top:var(--cy);width:0;height:var(--disc-r);transform-origin:0 0;transform:rotate(${180 + i * 60}deg);border-left:1px dashed cyan"></div>`,
      ).join("");
      debugEl.innerHTML =
        ring("var(--disc-r)", "lime") +
        ring("var(--hub-r)", "yellow") +
        `<div style="position:absolute;left:calc(var(--cx) - 4px);top:calc(var(--cy) - 4px);width:8px;height:8px;background:magenta;border-radius:50%"></div>` +
        axes;
      stage.appendChild(debugEl);
    },

    reset() {
      Object.assign(deps, original);
      lastTarget = null;
      api.debug(false);
      resetSpinState();
      resetRuleta();
    },
  };

  window.ruletaDev = api;
  console.info("[ruletaDev] ready. Try ruletaDev.help()");
}
