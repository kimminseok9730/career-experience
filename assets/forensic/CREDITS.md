# Heart anatomy assets

Human Reference Atlas / HuBMAP Consortium, Visible Human Male heart and blood vasculature, based on the National Library of Medicine Visible Human Project.

- Library: https://humanatlas.io/3d-reference-library
- Heart entry and license: https://3d.nih.gov/entries/21000?version=1
- Distribution: https://github.com/hubmapconsortium/ccf-releases/tree/main/v1.2/models
- Original files: VH_M_Heart.glb, VH_M_Blood_Vasculature.glb
- Local files: heart-hra.glb, vessels-hra.glb
- License: Creative Commons Attribution 4.0 International — https://creativecommons.org/licenses/by/4.0/

Adaptations in this application: selected heart-associated vascular structures; retained their source coordinate relationships; centered and uniformly scaled the combined anatomy; replaced illustrative colors/materials and lighting. Source GLB files remain unmodified. Texture variation is procedural and does not represent observed disease or a clinical specimen.

Artery and myocardial cross-sections are independently constructed teaching diagrams, not sections extracted from the HRA model. Room, instruments and drape are constructed for this educational application. No assertion of clinical validation is made.

## CASE 01 cut-heart assets (`case01/`, 2026-10-15)

Derived from the same HRA heart and blood-vasculature files above (CC BY 4.0). Built in Blender 5.2 by scripts kept in
`Documents/Codex/2026-09-08/dksu/지피티와 함께하는 직업 체험 앱 만들기/heart-render-2026-10-13/` (`build_geo.py`, `export_app.py`).

- Taken from the source as-is: ventricular and atrial wall shape, septum, papillary muscles, valves, and the course (centreline) of the coronary vessels.
- Reconstructed for teaching: the left ventricle, right ventricle and septum were merged; epicardial fat thickness (follows coronary vessels); coronary tube diameters (typical adult values, not this person's); narrow surface crevices in the source mesh filled with myocardium; great-vessel stumps; colours and materials.
- Educational lesion representation for the fictional CASE 01 (not medically reviewed): LAD plaque with lipid core and calcium flecks at three levels (85 / 55 / 30 % area narrowing), mild outward remodelling, and patchy subendocardial fibrosis in the LAD territory. `*-ref` parts are the same blocks with the lesion removed.
- No part shows or claims to show a real patient's disease.
