import { vi, describe, it, expect } from "vitest";
import axios from "axios";
import { runSimulation } from "../api/client.js";

vi.mock("axios");

describe("api client", () => {
  it("calls backend simulation endpoint", async () => {
    axios.create.mockReturnValue({
      post: vi.fn().mockResolvedValue({ data: { ok: true } })
    });

    const result = await runSimulation({ X0: 1 }, "fed_batch");

    expect(axios.create).toHaveBeenCalled();
    const instance = axios.create.mock.results[0].value;
    expect(instance.post).toHaveBeenCalledWith("/simulation/run?mode=fed_batch", { X0: 1 });
    expect(result).toEqual({ ok: true });
  });
});
