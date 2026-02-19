/**
 * VST3 Host — N-API native module for Rach DAW.
 *
 * Provides: scanPlugins, loadPlugin, unloadPlugin, getParameters,
 *           setParameter, processAudio, getState, setState
 *
 * Full implementation requires the Steinberg VST3 SDK.
 * This file provides the N-API binding layer with stub implementations
 * that return reasonable defaults when the SDK is not present.
 */

#include <napi.h>
#include <string>
#include <vector>
#include <map>
#include <memory>
#include <filesystem>

#ifdef HAS_VST3_SDK
#include "vst3-scanner.h"
#include "vst3-processor.h"
#endif

namespace fs = std::filesystem;

// Plugin info structure
struct PluginInfo {
    std::string path;
    std::string name;
    std::string vendor;
    std::string uid;
    bool isInstrument;
    bool isEffect;
};

// Loaded plugin state
struct LoadedPlugin {
    std::string uid;
    std::string path;
    std::string name;
    std::vector<std::pair<std::string, float>> parameters;
#ifdef HAS_VST3_SDK
    std::unique_ptr<VST3Processor> processor;
#endif
};

// Global state
static std::vector<PluginInfo> scannedPlugins;
static std::map<std::string, std::unique_ptr<LoadedPlugin>> loadedPlugins;
static int nextPluginId = 1;

/**
 * Scan for VST3 plugins in standard paths.
 * Returns array of { path, name, vendor, uid, isInstrument, isEffect }
 */
Napi::Value ScanPlugins(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    scannedPlugins.clear();

    // Standard VST3 search paths
    std::vector<std::string> searchPaths;

#ifdef __linux__
    searchPaths.push_back(std::string(getenv("HOME") ? getenv("HOME") : "") + "/.vst3");
    searchPaths.push_back("/usr/lib/vst3");
    searchPaths.push_back("/usr/local/lib/vst3");
#elif defined(__APPLE__)
    searchPaths.push_back("/Library/Audio/Plug-Ins/VST3");
    searchPaths.push_back(std::string(getenv("HOME") ? getenv("HOME") : "") + "/Library/Audio/Plug-Ins/VST3");
#elif defined(_WIN32)
    searchPaths.push_back("C:\\Program Files\\Common Files\\VST3");
    searchPaths.push_back("C:\\Program Files (x86)\\Common Files\\VST3");
#endif

#ifdef HAS_VST3_SDK
    scannedPlugins = VST3Scanner::scan(searchPaths);
#else
    // Stub: look for .vst3 files/dirs in search paths
    for (const auto& searchPath : searchPaths) {
        if (!fs::exists(searchPath)) continue;
        for (const auto& entry : fs::recursive_directory_iterator(searchPath)) {
            if (entry.path().extension() == ".vst3") {
                PluginInfo info;
                info.path = entry.path().string();
                info.name = entry.path().stem().string();
                info.vendor = "Unknown";
                info.uid = entry.path().string();
                info.isInstrument = false;
                info.isEffect = true;
                scannedPlugins.push_back(info);
            }
        }
    }
#endif

    // Convert to JS array
    Napi::Array result = Napi::Array::New(env, scannedPlugins.size());
    for (size_t i = 0; i < scannedPlugins.size(); i++) {
        Napi::Object obj = Napi::Object::New(env);
        obj.Set("path", scannedPlugins[i].path);
        obj.Set("name", scannedPlugins[i].name);
        obj.Set("vendor", scannedPlugins[i].vendor);
        obj.Set("uid", scannedPlugins[i].uid);
        obj.Set("isInstrument", scannedPlugins[i].isInstrument);
        obj.Set("isEffect", scannedPlugins[i].isEffect);
        result.Set(i, obj);
    }

    return result;
}

/**
 * Load a VST3 plugin by path.
 * Returns plugin instance ID string.
 */
Napi::Value LoadPlugin(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() < 1 || !info[0].IsString()) {
        Napi::TypeError::New(env, "Plugin path (string) required").ThrowAsJavaScriptException();
        return env.Null();
    }

    std::string path = info[0].As<Napi::String>().Utf8Value();
    std::string instanceId = "vst3-" + std::to_string(nextPluginId++);

    auto plugin = std::make_unique<LoadedPlugin>();
    plugin->path = path;
    plugin->uid = instanceId;
    plugin->name = fs::path(path).stem().string();

#ifdef HAS_VST3_SDK
    plugin->processor = std::make_unique<VST3Processor>();
    if (!plugin->processor->load(path)) {
        Napi::Error::New(env, "Failed to load plugin: " + path).ThrowAsJavaScriptException();
        return env.Null();
    }
    plugin->processor->initialize(44100, 512);
#endif

    loadedPlugins[instanceId] = std::move(plugin);
    return Napi::String::New(env, instanceId);
}

/**
 * Unload a plugin instance.
 */
Napi::Value UnloadPlugin(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    std::string id = info[0].As<Napi::String>().Utf8Value();
    loadedPlugins.erase(id);
    return env.Undefined();
}

/**
 * Get parameter list for a loaded plugin.
 */
Napi::Value GetParameters(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    std::string id = info[0].As<Napi::String>().Utf8Value();

    auto it = loadedPlugins.find(id);
    if (it == loadedPlugins.end()) {
        return Napi::Array::New(env, 0);
    }

    Napi::Array result = Napi::Array::New(env);

#ifdef HAS_VST3_SDK
    auto params = it->second->processor->getParameters();
    for (size_t i = 0; i < params.size(); i++) {
        Napi::Object obj = Napi::Object::New(env);
        obj.Set("id", params[i].id);
        obj.Set("name", params[i].name);
        obj.Set("value", params[i].value);
        obj.Set("min", 0.0);
        obj.Set("max", 1.0);
        result.Set(i, obj);
    }
#endif

    return result;
}

/**
 * Set a parameter value on a loaded plugin.
 */
Napi::Value SetParameter(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    std::string id = info[0].As<Napi::String>().Utf8Value();
    uint32_t paramId = info[1].As<Napi::Number>().Uint32Value();
    double value = info[2].As<Napi::Number>().DoubleValue();

    auto it = loadedPlugins.find(id);
    if (it != loadedPlugins.end()) {
#ifdef HAS_VST3_SDK
        it->second->processor->setParameter(paramId, value);
#endif
    }

    return env.Undefined();
}

/**
 * Process an audio buffer through a loaded plugin.
 * Input: Float32Array, Output: Float32Array (modified in-place).
 */
Napi::Value ProcessAudio(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    std::string id = info[0].As<Napi::String>().Utf8Value();
    Napi::Float32Array buffer = info[1].As<Napi::Float32Array>();

    auto it = loadedPlugins.find(id);
    if (it != loadedPlugins.end()) {
#ifdef HAS_VST3_SDK
        float* data = buffer.Data();
        size_t length = buffer.ElementLength();
        it->second->processor->process(data, length);
#endif
    }

    return buffer;
}

/**
 * Get plugin state as base64 string (for preset saving).
 */
Napi::Value GetState(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    std::string id = info[0].As<Napi::String>().Utf8Value();

    auto it = loadedPlugins.find(id);
    if (it == loadedPlugins.end()) {
        return Napi::String::New(env, "");
    }

#ifdef HAS_VST3_SDK
    std::string state = it->second->processor->getState();
    return Napi::String::New(env, state);
#else
    return Napi::String::New(env, "");
#endif
}

/**
 * Restore plugin state from base64 string.
 */
Napi::Value SetState(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    std::string id = info[0].As<Napi::String>().Utf8Value();
    std::string state = info[1].As<Napi::String>().Utf8Value();

    auto it = loadedPlugins.find(id);
    if (it != loadedPlugins.end()) {
#ifdef HAS_VST3_SDK
        it->second->processor->setState(state);
#endif
    }

    return env.Undefined();
}

// Module initialization
Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set("scanPlugins", Napi::Function::New(env, ScanPlugins));
    exports.Set("loadPlugin", Napi::Function::New(env, LoadPlugin));
    exports.Set("unloadPlugin", Napi::Function::New(env, UnloadPlugin));
    exports.Set("getParameters", Napi::Function::New(env, GetParameters));
    exports.Set("setParameter", Napi::Function::New(env, SetParameter));
    exports.Set("processAudio", Napi::Function::New(env, ProcessAudio));
    exports.Set("getState", Napi::Function::New(env, GetState));
    exports.Set("setState", Napi::Function::New(env, SetState));
    return exports;
}

NODE_API_MODULE(vst3_host, Init)
