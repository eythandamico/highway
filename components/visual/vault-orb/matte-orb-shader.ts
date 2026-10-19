import { LIQUID_ORB_SHADER } from './liquidOrbShader';

// Analytic sphere normals and broad area-light lobes create a satin,
// bead-blasted finish. No moving fluid, glass shell, or chrome reflections.
const matteSphere = `
fn matteGreenSphere(uv: vec2<f32>) -> vec4<f32> {
  let size = max(min(u.size.x, u.size.y), 1.0);
  let p = (uv * u.size * 2.0 - u.size) / (size * u.radius);
  let radius = length(p);
  let feather = 1.5 / (size * u.radius);
  let alpha = 1.0 - smoothstep(1.0 - feather, 1.0 + feather, radius);
  if (alpha <= 0.0) { return vec4<f32>(0.0); }
  let normal = normalize(vec3<f32>(p.x, -p.y, sqrt(max(0.0, 1.0 - dot(p, p)))));
  let light = normalize(vec3<f32>(-0.55, 0.7, 1.0));
  let view = vec3<f32>(0.0, 0.0, 1.0);
  let diffuse = max(dot(normal, light), 0.0);
  let fill = max(dot(normal, normalize(vec3<f32>(0.7, -0.2, 0.6))), 0.0);
  let roughSpecular = pow(max(dot(normal, normalize(light + view)), 0.0), 9.0);
  let base = vec3<f32>(217.0 / 255.0, 238.0 / 255.0, 138.0 / 255.0);
  var color = base * (0.72 + 0.24 * diffuse + 0.06 * fill);
  color = mix(color, vec3<f32>(0.98, 1.0, 0.89), roughSpecular * 0.18);
  // Fine, stationary microtexture stays below the strength of the lighting.
  let grain = fract(sin(dot(uv * u.size, vec2<f32>(12.9898, 78.233))) * 43758.5453);
  color += vec3<f32>((grain - 0.5) * 0.008);
  return vec4<f32>(clamp(color, vec3<f32>(0.0), vec3<f32>(1.0)) * alpha, alpha);
}
`;
export const MATTE_ORB_SHADER = LIQUID_ORB_SHADER.replace(
  '@fragment\nfn fs_main(in: VOut) -> @location(0) vec4<f32> {',
  `${matteSphere}\n@fragment\nfn fs_main(in: VOut) -> @location(0) vec4<f32> {\n  if (u.style > 24.5) { return matteGreenSphere(in.uv); }`,
);
