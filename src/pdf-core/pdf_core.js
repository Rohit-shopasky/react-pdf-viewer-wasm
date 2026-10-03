/* @ts-self-types="./pdf_core.d.ts" */

/**
 * Free a document from memory.
 *
 * Drops both the raw bytes and the cached metadata.
 * After this call, using the handle in any other function returns an error.
 * @param {number} doc_handle
 */
export function close_document(doc_handle) {
    const ret = wasm.close_document(doc_handle);
    if (ret[1]) {
        throw takeFromExternrefTable0(ret[0]);
    }
}

/**
 * Extract all text from a specific page.
 *
 * Returns an empty string if the page contains no selectable text
 * (e.g., scanned images without OCR).
 *
 * KNOWN LIMITATION: re-parses the PDF from bytes on every call.
 * Same root cause as `render_page`; see that function's doc comment for
 * the planned fix (`ouroboros` / `self_cell` self-referential struct).
 * @param {number} doc_handle
 * @param {number} page_index
 * @returns {string}
 */
export function extract_text(doc_handle, page_index) {
    const ret = wasm.extract_text(doc_handle, page_index);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v1 = getCachedStringFromWasm0(ret[0], ret[1]);
    if (ret[0] !== 0) { wasm.__wbindgen_free(ret[0], ret[1], 1); }
    return v1;
}

/**
 * Returns the total number of pages in the document.
 *
 * O(1) — served from the metadata cache built at `open_document` time.
 * Does **not** re-parse the PDF.
 * @param {number} doc_handle
 * @returns {number}
 */
export function get_page_count(doc_handle) {
    const ret = wasm.get_page_count(doc_handle);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0] >>> 0;
}

/**
 * Returns `[width_pts, height_pts]` for the given page.
 *
 * Dimensions are in **PDF points** (72 points = 1 inch).
 * Multiply by your `scale` factor to get pixel dimensions.
 *
 * O(1) — served from the metadata cache built at `open_document` time.
 * Does **not** re-parse the PDF.
 * @param {number} doc_handle
 * @param {number} page_index
 * @returns {Float32Array}
 */
export function get_page_dimensions(doc_handle, page_index) {
    const ret = wasm.get_page_dimensions(doc_handle, page_index);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v1 = getArrayF32FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v1;
}

/**
 * Returns per-character position data for a page, as a JSON string.
 * Coordinates are in PDF points, with origin at TOP-LEFT (converted from
 * pdfium's native bottom-left origin) so they map directly onto a
 * top-left-origin HTML/CSS layer once multiplied by your zoom scale.
 * @param {number} doc_handle
 * @param {number} page_index
 * @returns {string}
 */
export function get_text_chars(doc_handle, page_index) {
    const ret = wasm.get_text_chars(doc_handle, page_index);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v1 = getCachedStringFromWasm0(ret[0], ret[1]);
    if (ret[0] !== 0) { wasm.__wbindgen_free(ret[0], ret[1], 1); }
    return v1;
}

/**
 * Initialize the pdfium binding.
 *
 * **Must be called once before any other function.**
 * Calling it multiple times is safe — subsequent calls are no-ops.
 *
 * On native (cargo test): links against the system pdfium shared library.
 * On WASM:               connects to the pdfium.wasm module loaded by the JS host.
 */
export function initialize() {
    const ret = wasm.initialize();
    if (ret[1]) {
        throw takeFromExternrefTable0(ret[0]);
    }
}

/**
 * Establishes a binding between an external Pdfium WASM module and `pdfium-render`'s WASM module.
 * This function should be called from Javascript once the external Pdfium WASM module has been loaded
 * into the browser. It is essential that this function is called _before_ initializing
 * `pdfium-render` from within Rust code. For an example, see:
 * <https://github.com/ajrcarey/pdfium-render/blob/master/examples/index.html>
 * @param {any} pdfium_wasm_module
 * @param {any} local_wasm_module
 * @param {boolean} debug
 * @returns {boolean}
 */
export function initialize_pdfium_render(pdfium_wasm_module, local_wasm_module, debug) {
    const ret = wasm.initialize_pdfium_render(pdfium_wasm_module, local_wasm_module, debug);
    return ret !== 0;
}

/**
 * Load a PDF from raw bytes.
 *
 * Returns a **document handle** (u32) that identifies this document in all
 * subsequent calls.  Call `close_document()` when done to free memory.
 *
 * This is the **only** time the full PDF is parsed to extract metadata.
 * Page count and page dimensions are cached here so subsequent calls to
 * `get_page_count` and `get_page_dimensions` are O(1) and never re-parse.
 *
 * Errors if the bytes are not a valid PDF.
 * @param {Uint8Array} bytes
 * @param {string | null} [password]
 * @returns {number}
 */
export function open_document(bytes, password) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    var ptr1 = isLikeNone(password) ? 0 : passStringToWasm0(password, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    const ret = wasm.open_document(ptr0, len0, ptr1, len1);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0] >>> 0;
}

/**
 * A callback function that can be invoked by Pdfium's `FPDF_LoadCustomDocument()` function,
 * wrapping around `crate::utils::files::read_block_from_callback()` to shuffle data buffers
 * from our WASM memory heap to Pdfium's WASM memory heap as they are loaded.
 * @param {number} param
 * @param {number} position
 * @param {number} pBuf
 * @param {number} size
 * @returns {number}
 */
export function read_block_from_callback_wasm(param, position, pBuf, size) {
    const ret = wasm.read_block_from_callback_wasm(param, position, pBuf, size);
    return ret;
}

/**
 * Render a single page to raw **RGBA pixel data**.
 *
 * - `scale = 1.0` → 72 DPI (native PDF point resolution)
 * - `scale = 1.5` → 108 DPI
 * - `scale = 2.0` → 144 DPI (retina-quality)
 *
 * Returns a flat `Uint8Array` of `[R, G, B, A, R, G, B, A, …]` bytes.
 * The output pixel dimensions are `round(width_pts * scale) × round(height_pts * scale)`.
 *
 * Call `get_page_dimensions()` beforehand to know the canvas size (O(1), no re-parse).
 *
 * KNOWN LIMITATION: re-parses the PDF from bytes on every call.
 * For a user scrolling through a 200-page document this means 200 re-parses.
 * Future fix: use `ouroboros` or `self_cell` to store a parsed `PdfDocument`
 * alongside the bytes it borrows from, eliminating the re-parse entirely.
 * @param {number} doc_handle
 * @param {number} page_index
 * @param {number} scale
 * @param {number} rotation_degrees
 * @returns {Uint8Array}
 */
export function render_page(doc_handle, page_index, scale, rotation_degrees) {
    const ret = wasm.render_page(doc_handle, page_index, scale, rotation_degrees);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

export function start() {
    wasm.start();
}

/**
 * A callback function that can be invoked by Pdfium's `FPDF_SaveAsCopy()` and `FPDF_SaveWithVersion()`
 * functions, wrapping around `crate::utils::files::write_block_from_callback()` to shuffle data buffers
 * from Pdfium's WASM memory heap to our WASM memory heap as they are written.
 * @param {number} param
 * @param {number} buf
 * @param {number} size
 * @returns {number}
 */
export function write_block_from_callback_wasm(param, buf, size) {
    const ret = wasm.write_block_from_callback_wasm(param, buf, size);
    return ret;
}
function __wbg_get_imports() {
    const import0 = {
        __proto__: null,
        __wbg___wbindgen_debug_string_0e68cf47c9cbd9b0: function (arg0, arg1) {
            const ret = debugString(arg1);
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg___wbindgen_is_object_edb6b15aa3afe12e: function (arg0) {
            const val = arg0;
            const ret = typeof (val) === 'object' && val !== null;
            return ret;
        },
        __wbg___wbindgen_is_undefined_8c687d0b90d5b524: function (arg0) {
            const ret = arg0 === undefined;
            return ret;
        },
        __wbg___wbindgen_jsval_eq_9fdcd3c0a860dd3b: function (arg0, arg1) {
            const ret = arg0 === arg1;
            return ret;
        },
        __wbg___wbindgen_number_get_1dc732b810cb937c: function (arg0, arg1) {
            const obj = arg1;
            const ret = typeof (obj) === 'number' ? obj : undefined;
            getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
        },
        __wbg___wbindgen_string_get_92ab86bb19cbc12f: function (arg0, arg1) {
            const obj = arg1;
            const ret = typeof (obj) === 'string' ? obj : undefined;
            var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg___wbindgen_throw_5d9e815e6fdf150f: function (arg0, arg1) {
            var v0 = getCachedStringFromWasm0(arg0, arg1);
            throw new Error(v0);
        },
        __wbg_apply_5d9aa7604c2490a8: function () {
            return handleError(function (arg0, arg1, arg2) {
                const ret = arg0.apply(arg1, arg2);
                return ret;
            }, arguments);
        },
        __wbg_call_6bcf8d3e20937e46: function () {
            return handleError(function (arg0, arg1, arg2) {
                const ret = arg0.call(arg1, arg2);
                return ret;
            }, arguments);
        },
        __wbg_debug_eb092a10b3338acb: function (arg0) {
            console.debug(arg0);
        },
        __wbg_decode_ec8279b49e2f79cf: function () {
            return handleError(function (arg0, arg1, arg2, arg3) {
                const ret = arg1.decode(getArrayU8FromWasm0(arg2, arg3));
                const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
                const len1 = WASM_VECTOR_LEN;
                getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
                getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
            }, arguments);
        },
        __wbg_error_756c5934221e6fee: function (arg0) {
            console.error(arg0);
        },
        __wbg_error_757e9472f8410341: function (arg0, arg1) {
            var v0 = getCachedStringFromWasm0(arg0, arg1);
            if (arg0 !== 0) { wasm.__wbindgen_free(arg0, arg1, 1); }
            console.error(v0);
        },
        __wbg_from_a39669ce566077da: function (arg0) {
            const ret = Array.from(arg0);
            return ret;
        },
        __wbg_getTime_65922ba0b59d55a7: function (arg0) {
            const ret = arg0.getTime();
            return ret;
        },
        __wbg_get_97dc2df9d87d0f6a: function () {
            return handleError(function (arg0, arg1) {
                const ret = arg0.get(arg1 >>> 0);
                return ret;
            }, arguments);
        },
        __wbg_get_989d0a1309644f2b: function () {
            return handleError(function (arg0, arg1) {
                const ret = Reflect.get(arg0, arg1);
                return ret;
            }, arguments);
        },
        __wbg_get_index_a916f0ff97f6772a: function (arg0, arg1) {
            const ret = arg0[arg1 >>> 0];
            return ret;
        },
        __wbg_get_unchecked_363572bdd397d473: function (arg0, arg1) {
            const ret = arg0[arg1 >>> 0];
            return ret;
        },
        __wbg_info_f25c01bee103395d: function (arg0) {
            console.info(arg0);
        },
        __wbg_isArray_5674713bb7b79043: function (arg0) {
            const ret = Array.isArray(arg0);
            return ret;
        },
        __wbg_length_31bdaf014f5fbde2: function (arg0) {
            const ret = arg0.length;
            return ret;
        },
        __wbg_length_4e1adc0d42e23620: function (arg0) {
            const ret = arg0.length;
            return ret;
        },
        __wbg_length_e1c40798f58a4170: function (arg0) {
            const ret = arg0.length;
            return ret;
        },
        __wbg_length_e87c15f832faddc2: function (arg0) {
            const ret = arg0.length;
            return ret;
        },
        __wbg_log_363d83b9114c8831: function (arg0) {
            console.log(arg0);
        },
        __wbg_new_0_35540e542ba689d2: function () {
            const ret = new Date();
            return ret;
        },
        __wbg_new_227d7c05414eb861: function () {
            const ret = new Error();
            return ret;
        },
        __wbg_new_ffa92086ea89f79c: function () {
            const ret = new Array();
            return ret;
        },
        __wbg_new_from_slice_4ee02165f9de919e: function (arg0, arg1) {
            const ret = new Uint8Array(getArrayU8FromWasm0(arg0, arg1));
            return ret;
        },
        __wbg_new_with_label_aad02dde1eb03f9b: function () {
            return handleError(function (arg0, arg1) {
                var v0 = getCachedStringFromWasm0(arg0, arg1);
                const ret = new TextDecoder(v0);
                return ret;
            }, arguments);
        },
        __wbg_new_with_length_6a9fc3631737ef8c: function (arg0) {
            const ret = new Array(arg0 >>> 0);
            return ret;
        },
        __wbg_of_04ed67a73000e0bd: function (arg0, arg1, arg2, arg3) {
            const ret = Array.of(arg0, arg1, arg2, arg3);
            return ret;
        },
        __wbg_of_1a3f47170341cefe: function (arg0) {
            const ret = Array.of(arg0);
            return ret;
        },
        __wbg_of_1c173c2ad96e2f7e: function (arg0, arg1) {
            const ret = Array.of(arg0, arg1);
            return ret;
        },
        __wbg_of_8211d46fcab1ec90: function (arg0, arg1, arg2, arg3, arg4) {
            const ret = Array.of(arg0, arg1, arg2, arg3, arg4);
            return ret;
        },
        __wbg_of_d9a05aa72bb023a2: function (arg0, arg1, arg2) {
            const ret = Array.of(arg0, arg1, arg2);
            return ret;
        },
        __wbg_prototypesetcall_ae9f5e7459250748: function (arg0, arg1, arg2) {
            Uint8Array.prototype.set.call(getArrayU8FromWasm0(arg0, arg1), arg2);
        },
        __wbg_push_bfdf956ba476f65b: function (arg0, arg1) {
            const ret = arg0.push(arg1);
            return ret;
        },
        __wbg_set_13d25b81ab403f5e: function (arg0, arg1, arg2) {
            arg0[arg1 >>> 0] = arg2;
        },
        __wbg_set_361ed22a3b8802e9: function () {
            return handleError(function (arg0, arg1, arg2) {
                arg0.set(arg1 >>> 0, arg2);
            }, arguments);
        },
        __wbg_set_9cfc0f17d60ff0af: function (arg0, arg1, arg2) {
            arg0.set(arg1, arg2 >>> 0);
        },
        __wbg_slice_ec88db741786524b: function (arg0, arg1, arg2) {
            const ret = arg0.slice(arg1 >>> 0, arg2 >>> 0);
            return ret;
        },
        __wbg_stack_3b0d974bbf31e44f: function (arg0, arg1) {
            const ret = arg1.stack;
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg_static_accessor_GLOBAL_8eb4cd83130a11a0: function () {
            const ret = typeof global === 'undefined' ? null : global;
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        __wbg_static_accessor_GLOBAL_THIS_1e7044f654e934db: function () {
            const ret = typeof globalThis === 'undefined' ? null : globalThis;
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        __wbg_static_accessor_SELF_d8b50611246a6d92: function () {
            const ret = typeof self === 'undefined' ? null : self;
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        __wbg_static_accessor_WINDOW_fd0bc376bf0f8b42: function () {
            const ret = typeof window === 'undefined' ? null : window;
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        __wbg_subarray_1daff70dde20c145: function (arg0, arg1, arg2) {
            const ret = arg0.subarray(arg1 >>> 0, arg2 >>> 0);
            return ret;
        },
        __wbg_warn_d3544c7814fab534: function (arg0) {
            console.warn(arg0);
        },
        __wbindgen_generic_0000000000000001: function (arg0) {
            // Cast intrinsic for `F64 -> Externref`.
            const ret = arg0;
            return ret;
        },
        __wbindgen_generic_0000000000000002: function (arg0, arg1) {
            var v0 = getCachedStringFromWasm0(arg0, arg1);
            // Cast intrinsic for `Ref(CachedString) -> Externref`.
            const ret = v0;
            return ret;
        },
        __wbindgen_generic_0000000000000003: function (arg0, arg1) {
            // Cast intrinsic for `Ref(Slice(U8)) -> NamedExternref("Uint8Array")`.
            const ret = getArrayU8FromWasm0(arg0, arg1);
            return ret;
        },
        __wbindgen_init_externref_table: function () {
            const table = wasm.__wbindgen_externrefs;
            const offset = table.grow(4);
            table.set(0, undefined);
            table.set(offset + 0, undefined);
            table.set(offset + 1, null);
            table.set(offset + 2, true);
            table.set(offset + 3, false);
        },
    };
    return {
        __proto__: null,
        "./pdf_core_bg.js": import0,
    };
}

function addToExternrefTable0(obj) {
    const idx = wasm.__externref_table_alloc();
    wasm.__wbindgen_externrefs.set(idx, obj);
    return idx;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for (let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches && builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function getArrayF32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getFloat32ArrayMemory0().subarray(ptr / 4, ptr / 4 + len);
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

function getCachedStringFromWasm0(ptr, len) {
    if (ptr === 0) {
        return getFromExternrefTable0(len);
    } else {
        return getStringFromWasm0(ptr, len);
    }
}

let cachedDataViewMemory0 = null;
function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

let cachedFloat32ArrayMemory0 = null;
function getFloat32ArrayMemory0() {
    if (cachedFloat32ArrayMemory0 === null || cachedFloat32ArrayMemory0.byteLength === 0) {
        cachedFloat32ArrayMemory0 = new Float32Array(wasm.memory.buffer);
    }
    return cachedFloat32ArrayMemory0;
}

function getFromExternrefTable0(idx) { return wasm.__wbindgen_externrefs.get(idx); }

function getStringFromWasm0(ptr, len) {
    return decodeText(ptr >>> 0, len);
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        const idx = addToExternrefTable0(e);
        wasm.__wbindgen_exn_store(idx);
    }
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1, 1) >>> 0;
    getUint8ArrayMemory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function takeFromExternrefTable0(idx) {
    const value = wasm.__wbindgen_externrefs.get(idx);
    wasm.__externref_table_dealloc(idx);
    return value;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    };
}

let WASM_VECTOR_LEN = 0;

let wasmModule, wasmInstance, wasm;
function __wbg_finalize_init(instance, module) {
    wasmInstance = instance;
    wasm = instance.exports;
    wasmModule = module;
    cachedDataViewMemory0 = null;
    cachedFloat32ArrayMemory0 = null;
    cachedUint8ArrayMemory0 = null;
    wasm.__wbindgen_start();
    return wasm;
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (!module.ok) {
            throw new Error(`failed to fetch Wasm: ${module.status} ${module.statusText} fetching '${module.url}'`);
        }

        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);
            } catch (e) {
                const validResponse = expectedResponseType(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else { throw e; }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);
    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };
        } else {
            return instance;
        }
    }

    function expectedResponseType(type) {
        switch (type) {
            case 'basic': case 'cors': case 'default': return true;
        }
        return false;
    }
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (module !== undefined) {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({ module } = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();
    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }
    const instance = new WebAssembly.Instance(module, imports);
    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (module_or_path !== undefined) {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({ module_or_path } = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (module_or_path === undefined) {
        module_or_path = new URL('pdf_core_bg.wasm?no-inline', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync, __wbg_init as default };
