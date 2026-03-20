#ifndef ATOMIC_ORBITAL_MODEL_H
#define ATOMIC_ORBITAL_MODEL_H

#include <stddef.h>

#if defined(_WIN32) && defined(ATOMIC_ORBITAL_BUILD_DLL)
#define ATOMIC_ORBITAL_API __declspec(dllexport)
#elif defined(_WIN32)
#define ATOMIC_ORBITAL_API __declspec(dllimport)
#else
#define ATOMIC_ORBITAL_API
#endif

#ifdef __cplusplus
extern "C" {
#endif

typedef struct {
    int n;
    int l;
    int m;
    int sample_count;
    double radial_max;
    unsigned int seed;
} AtomicOrbitalParams;

typedef struct {
    double x;
    double y;
    double z;
    double radius;
    double theta;
    double phi;
    double probability_density;
    double normalized_intensity;
} AtomicOrbitalSample;

ATOMIC_ORBITAL_API int sample_atomic_orbital(
    const AtomicOrbitalParams *params,
    AtomicOrbitalSample *samples_out
);

#ifdef __cplusplus
}
#endif

#endif
