cmake_minimum_required(VERSION 3.15)
project(rach-native)

# C++ standard
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Node.js addon API
include_directories(${CMAKE_JS_INC})

# VST3 SDK (git submodule expected at electron/native/vst3sdk)
set(VST3_SDK_DIR "${CMAKE_CURRENT_SOURCE_DIR}/vst3sdk")
if(EXISTS "${VST3_SDK_DIR}/CMakeLists.txt")
  add_subdirectory(${VST3_SDK_DIR} EXCLUDE_FROM_ALL)
  set(HAS_VST3_SDK TRUE)
else()
  message(WARNING "VST3 SDK not found at ${VST3_SDK_DIR}. Building without VST3 support.")
  set(HAS_VST3_SDK FALSE)
endif()

# Sources
set(SOURCES
  vst3-host.cc
  vst3-scanner.cc
  vst3-processor.cc
)

# Build the native addon
add_library(vst3_host SHARED ${SOURCES} ${CMAKE_JS_SRC})
set_target_properties(vst3_host PROPERTIES PREFIX "" SUFFIX ".node")
target_include_directories(vst3_host PRIVATE ${CMAKE_JS_INC})

# Link node-addon-api
execute_process(COMMAND node -p "require('node-addon-api').include"
  WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}
  OUTPUT_VARIABLE NODE_ADDON_API_DIR
  OUTPUT_STRIP_TRAILING_WHITESPACE)
string(REPLACE "\"" "" NODE_ADDON_API_DIR ${NODE_ADDON_API_DIR})
target_include_directories(vst3_host PRIVATE ${NODE_ADDON_API_DIR})

# Define N-API version
target_compile_definitions(vst3_host PRIVATE NAPI_VERSION=8)

# Link VST3 SDK if available
if(HAS_VST3_SDK)
  target_link_libraries(vst3_host PRIVATE sdk)
  target_compile_definitions(vst3_host PRIVATE HAS_VST3_SDK=1)
endif()

# Link cmake-js
target_link_libraries(vst3_host ${CMAKE_JS_LIB})
