from flask import Flask, request, jsonify
import base64
import time
from extractor import extract_text
from ranker import rank_resumes, get_semantic_model
from parser import get_ner_pipeline
from utils import validate_request, format_error_response, format_success_response, logger
from config import DEFAULT_TOP_K, REQUEST_TIMEOUT

app = Flask(__name__)


def warmup_models():
    logger.info("Warming up ML models...")
    try:
        get_semantic_model()
        get_ner_pipeline()
        logger.info("Models warmed up successfully")
    except Exception as e:
        logger.error(f"Error warming up models: {str(e)}")


with app.app_context():
    warmup_models()


@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "Resume Ranking API",
        "version": "2.0"
    }), 200


@app.route('/rank_resumes_upload', methods=['POST'])
def rank_resumes_upload_endpoint():

    start_time = time.time()

    try:
        job_description = request.form.get('job_description')

        if not job_description:
            return jsonify(format_error_response("Missing 'job_description' field")), 400

        if len(job_description.strip()) < 50:
            return jsonify(format_error_response("Job description is too short (minimum 50 characters)")), 400

        top_k = request.form.get('top_k', DEFAULT_TOP_K)
        try:
            top_k = int(top_k)
            if top_k < 1:
                return jsonify(format_error_response("'top_k' must be a positive integer")), 400
        except ValueError:
            return jsonify(format_error_response("'top_k' must be a valid integer")), 400

        files = request.files.getlist('resumes')

        if not files or len(files) == 0:
            return jsonify(format_error_response("No resume files provided")), 400

        logger.info(
            f"Processing {len(files)} uploaded resumes, returning top {top_k}")

        resumes_data = []

        for i, file in enumerate(files):
            try:
                if not file or file.filename == '':
                    logger.warning(f"Resume {i}: Empty file")
                    continue

                filename = file.filename.lower()
                if filename.endswith('.pdf'):
                    file_type = 'pdf'
                elif filename.endswith('.docx'):
                    file_type = 'docx'
                else:
                    logger.warning(
                        f"Resume {i}: Unsupported file type - {filename}")
                    continue

                file_bytes = file.read()

                if len(file_bytes) == 0:
                    logger.warning(f"Resume {i}: Empty file content")
                    continue

                text = extract_text(file_bytes, file_type)

                if not text or len(text.strip()) < 50:
                    logger.warning(
                        f"Resume {i} ({filename}): Insufficient text content")
                    continue

                resumes_data.append({
                    'index': i,
                    'text': text,
                    'file_type': file_type,
                    'filename': filename
                })

            except Exception as e:
                logger.error(f"Error processing resume {i}: {str(e)}")
                continue

        if not resumes_data:
            return jsonify(format_error_response(
                "No valid resumes could be processed. Please check file formats and content."
            )), 400

        if top_k > len(resumes_data):
            top_k = len(resumes_data)

        ranked_results = rank_resumes(resumes_data, job_description, top_k)

        processing_time = round(time.time() - start_time, 2)

        logger.info(f"Request completed in {processing_time}s")

        response = format_success_response(ranked_results, len(resumes_data))
        response['processing_time_seconds'] = processing_time

        return jsonify(response), 200

    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        return jsonify(format_error_response(
            f"Internal server error: {str(e)}"
        )), 500


@app.route('/rank_resumes', methods=['POST'])
def rank_resumes_endpoint():

    start_time = time.time()

    try:
        # Get request data
        data = request.json

        # Validate request
        is_valid, error_message = validate_request(data)
        if not is_valid:
            logger.warning(f"Invalid request: {error_message}")
            return jsonify(format_error_response(error_message))

        # Extract parameters
        job_description = data['job_description']
        resumes = data['resumes']
        top_k = data.get('top_k', DEFAULT_TOP_K)

        # Validate top_k
        if not isinstance(top_k, int) or top_k < 1:
            return jsonify(format_error_response("'top_k' must be a positive integer"))

        if top_k > len(resumes):
            top_k = len(resumes)

        logger.info(
            f"Processing {len(resumes)} resumes, returning top {top_k}")

        # Process resumes
        resumes_data = []

        for i, resume in enumerate(resumes):
            try:
                file_base64 = resume['file_base64']
                file_type = resume.get('file_type', 'pdf')

                # Decode base64
                file_bytes = base64.b64decode(file_base64)

                # Extract text
                text = extract_text(file_bytes, file_type)

                if not text or len(text.strip()) < 50:
                    logger.warning(f"Resume {i} has insufficient text content")
                    continue

                resumes_data.append({
                    'index': i,
                    'text': text,
                    'file_type': file_type
                })

            except Exception as e:
                logger.error(f"Error processing resume {i}: {str(e)}")
                continue

        if not resumes_data:
            return jsonify(format_error_response(
                "No valid resumes could be processed. Please check file formats and content."
            ))

        # Rank resumes
        ranked_results = rank_resumes(resumes_data, job_description, top_k)

        # Calculate processing time
        processing_time = round(time.time() - start_time, 2)

        logger.info(f"Request completed in {processing_time}s")

        # Format response
        response = format_success_response(ranked_results, len(resumes_data))
        response['processing_time_seconds'] = processing_time

        return jsonify(response), 200

    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        return jsonify(format_error_response(
            f"Internal server error: {str(e)}"
        )), 500


if __name__ == '__main__':
    logger.info("Starting Resume Ranking API...")
    app.run(debug=True, host='0.0.0.0', port=5000)
