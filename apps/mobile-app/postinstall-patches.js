/**
 * postinstall-patches.js
 * Patches node_modules build.gradle files for AGP 8.x compatibility.
 * Run automatically via "postinstall" in package.json.
 */
const fs = require('fs');
const path = require('path');

const patches = [
  {
    name: 'react-native-safe-area-context',
    file: path.join(__dirname, 'node_modules', 'react-native-safe-area-context', 'android', 'build.gradle'),
    marker: 'classpath("com.android.tools.build:gradle:7.3.1")',
    content: `// Patched for AGP 8.x compatibility - removed conflicting buildscript classpath
def getExtOrDefault(name, defaultValue) {
    return rootProject.ext.has(name) ? rootProject.ext.get(name) : defaultValue
}

def isNewArchitectureEnabled() {
    return project.hasProperty("newArchEnabled") && project.newArchEnabled == "true"
}

apply plugin: 'com.android.library'
apply plugin: 'kotlin-android'

if (isNewArchitectureEnabled()) {
    apply plugin: "com.facebook.react"
}

android {
    namespace "com.th3rdwave.safeareacontext"

    buildFeatures {
        buildConfig true
    }

    compileSdkVersion getExtOrDefault('compileSdkVersion', 34)

    if (rootProject.hasProperty("ndkPath")) {
        ndkPath rootProject.ext.ndkPath
    }
    if (rootProject.hasProperty("ndkVersion")) {
        ndkVersion rootProject.ext.ndkVersion
    }

    defaultConfig {
        minSdkVersion getExtOrDefault('minSdkVersion', 21)
        targetSdkVersion getExtOrDefault('targetSdkVersion', 34)
        versionCode 1
        versionName "1.0"
        buildConfigField "boolean", "IS_NEW_ARCHITECTURE_ENABLED", isNewArchitectureEnabled().toString()
    }

    lintOptions {
        abortOnError false
    }

    packagingOptions {
        exclude "**/libreact_render*.so"
    }

    sourceSets.main {
        java {
            if (isNewArchitectureEnabled()) {
                srcDirs += [
                    "src/fabric/java",
                    "\${project.buildDir}/generated/source/codegen/java"
                ]
            } else {
                srcDirs += [
                    "src/paper/java"
                ]
            }
        }
    }
}

def reactNativeArchitectures() {
    def value = project.getProperties().get("reactNativeArchitectures")
    return value ? value.split(",") : [
        "armeabi-v7a",
        "x86",
        "x86_64",
        "arm64-v8a"
    ]
}

repositories {
    google()
    maven {
        url "\$rootDir/../node_modules/react-native/android"
    }
    mavenCentral()
}

def kotlin_version = getExtOrDefault('kotlinVersion', project.properties['RNSAC_kotlinVersion'])

dependencies {
    implementation 'com.facebook.react:react-native:+'
    implementation "org.jetbrains.kotlin:kotlin-stdlib:\$kotlin_version"
}
`
  },
  {
    name: 'react-native-background-actions',
    file: path.join(__dirname, 'node_modules', 'react-native-background-actions', 'android', 'build.gradle'),
    marker: 'if (project.android.hasProperty("namespace"))',
    content: `// Patched for AGP 8.x compatibility
apply plugin: 'com.android.library'

def safeExtGet(prop, fallback) {
    rootProject.ext.has(prop) ? rootProject.ext.get(prop) : fallback
}

android {
    namespace "com.asterinet.react.bgactions"
    compileSdkVersion safeExtGet('compileSdkVersion', 34)

    defaultConfig {
        minSdkVersion safeExtGet('minSdkVersion', 21)
        targetSdkVersion safeExtGet('targetSdkVersion', 34)
    }
}

dependencies {
    //noinspection GradleDynamicVersion
    implementation 'com.facebook.react:react-native:+'  // From node_modules
}
`
  }
];

let patchCount = 0;
for (const patch of patches) {
  if (!fs.existsSync(patch.file)) {
    console.log(`[patch] SKIP ${patch.name} - file not found`);
    continue;
  }
  const current = fs.readFileSync(patch.file, 'utf8');
  if (current.includes(patch.marker)) {
    fs.writeFileSync(patch.file, patch.content, 'utf8');
    console.log(`[patch] PATCHED ${patch.name} for AGP 8.x compatibility`);
    patchCount++;
  } else {
    console.log(`[patch] OK ${patch.name} - already patched or not needed`);
  }
}
console.log(`[patch] Done. ${patchCount} file(s) patched.`);
